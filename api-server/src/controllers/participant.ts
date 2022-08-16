import { ethers } from 'ethers';
import { auth } from "firebase-admin";
import {config as dotEnvConfig} from 'dotenv';
import { LoginRequest, LoginResponse } from "../models/participant";

dotEnvConfig();

export async function loginParticipant(loginRequest: LoginRequest): Promise<LoginResponse> {
    const {address, signature} = loginRequest;
    const signedMessage: string = process.env.SIGNED_MESSAGE!;
    const hash = ethers.utils.hashMessage(signedMessage);
    const recoveredAddress = ethers.utils.recoverAddress(hash, signature);
    // check signature is correct
    if (recoveredAddress !== ethers.utils.getAddress(address)){
        return <LoginResponse>{code: -1, message: "Invalid signature"};
    }
    try {
        // check if user exists
        const firebaseAuth = auth();
        const user = await firebaseAuth.getUser(address);
        const token = await firebaseAuth.createCustomToken(user.uid);
        return <LoginResponse>{code: 0, token: token, message: 'User logged in'};
    } catch (error: any) {
        if (error.code === 'auth/user-not-found'){
            const result = await createParticipant(address);
            return result;
        } else {
            // something went wrong with Firebase
            return <LoginResponse>{code: -3, message: error}
        }
    }
}

async function createParticipant(address: string): Promise<LoginResponse> {
     const RPCnode = new ethers.providers.JsonRpcProvider(process.env.ETH_RPC_URL);
     // require more than 3 txs, as an anti-sybil mechanism
     const nonce = await RPCnode.getTransactionCount(address);
     const nonceMinimum= Number(process.env.ANTI_SYBIL_NONCE_MINIMUM);
     if (nonce <  nonceMinimum){
         return <LoginResponse>{code: -2, message: 'Address is too new'};
     }
     // reverse lookup ENS name
     const ensName = await RPCnode.lookupAddress(address);
     try {
        const firebaseAuth = auth();
        const user = await firebaseAuth.createUser({uid : address, displayName: ensName || address});
        const token = await firebaseAuth.createCustomToken(user.uid);
        return <LoginResponse>{code: 1, token: token, message: 'User created'};
     } catch (error) {
        // something went wrong creating the user
        // auth/uid-already-exists is covered in an upper level (login function)
        return <LoginResponse>{code: -4, message: error};
     }
}