import { ethers } from 'ethers';
import jwt, { Secret } from 'jsonwebtoken';
import {config as dotEnvConfig} from 'dotenv';
import { getFirestore } from 'firebase-admin/firestore';
import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest, LoginRequest, LoginResponse } from "../models/request";
import { Participant } from "../models/participant";
import { getCeremony } from './ceremony';


dotEnvConfig();
const DOMAIN: string = process.env.DOMAIN!;
const JWT_SECRET_KEY: Secret = process.env.JWT_SECRET_KEY!;
const JWT_EXPIRATION_TIME: string = process.env.JWT_EXPIRATION_TIME!;
const SIGNED_MESSAGE: string = process.env.SIGNED_MESSAGE!;

export async function loginParticipantWithAddress(loginRequest: LoginRequest): Promise<LoginResponse> {
    const {address, signature} = loginRequest;
    if ( isSignatureInvalid(address, signature) ){
        return <LoginResponse>{code: -1, message: "Invalid signature"};
    }
    const user = await getParticipant(address);
    if(user){
        const token = createToken(user);
        return <LoginResponse>{code: 0, token: token, message: 'Participant logged in'};
    } else {
        const result = await createParticipant(address);
        return result;
    }
}

function isSignatureInvalid(address: string, signature: string): boolean {
    const hash = ethers.utils.hashMessage(SIGNED_MESSAGE);
    const recoveredAddress = ethers.utils.recoverAddress(hash, signature);
    return recoveredAddress !== ethers.utils.getAddress(address);
}

async function getParticipant(address: string): Promise<Participant> {
    const db = getFirestore();
    const raw = await db.collection('users-'+DOMAIN).doc(address).get();
    const data = raw.data() as Participant;
    return data;
}

function createToken(user: Participant): string {
    const token = jwt.sign(user, JWT_SECRET_KEY, { expiresIn: JWT_EXPIRATION_TIME});
    return token;
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
     try {
        const ensName = await RPCnode.lookupAddress(address);
        const [currentIndex, highestIndex] = await getCurrentIndexAndHighestIndex()
        const db = getFirestore();
        const user: Participant = {
            uid: address,
            displayName: ensName || address,
            role: 'PARTICIPANT',
            addedAt: new Date(),
            lastUpdate: new Date(),
            status: "WAITING",
            index: highestIndex,
            expectedTimeToStart: new Date(), // TODO
            checkingDeadline: new Date(), // TODO
        };
        await db.collection('users-'+DOMAIN).doc(address).set(user);
        const token = createToken(user);
        return <LoginResponse>{code: 1, token: token, message: 'Participant created'};
     } catch (error) {
        // something went wrong creating the user
        // uid already exists is covered in an upper level (login function)
        return <LoginResponse>{code: -3, message: error};
     }
}

async function getCurrentIndexAndHighestIndex(): Promise<[number,number]> {
    const ceremony = await getCeremony();
    const currentIndex = ceremony.currentIndex;
    const highestIndex = ceremony.highestQueueIndex;
    ceremony.highestQueueIndex = highestIndex + 1;
    const db = getFirestore();
    await db.collection('counts').doc(DOMAIN).set(ceremony);
    return [currentIndex, highestIndex];
}

export async function authenticateParticipant(req: Request, res: Response, next: NextFunction){
    const authHeader = req.headers.authorization;
    if (!authHeader){
        res.sendStatus(401);
    }
    const token = authHeader?.split(" ")[1];
    try {
        const user = jwt.verify(token || '', JWT_SECRET_KEY) as Participant;
        (req as AuthenticatedRequest).user = user;
        return next();
    } catch (error) {
        // TODO: specific error in logs. In all error catches
        res.sendStatus(401);
    }
}

