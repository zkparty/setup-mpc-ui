import { ethers } from 'ethers';
import jwt, { Secret } from 'jsonwebtoken';
import {config as dotEnvConfig} from 'dotenv';
import { getFirestore } from 'firebase-admin/firestore';
import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest, GithubUserProfile, LoginRequest, LoginResponse } from "../models/request";
import { Participant } from "../models/participant";
import { getCeremony } from './ceremony';


dotEnvConfig();
const DOMAIN: string = process.env.DOMAIN!;
const ETH_RPC_URL: string = process.env.ETH_RPC_URL!;
const JWT_SECRET_KEY: Secret = process.env.JWT_SECRET_KEY!;
const SIGNED_MESSAGE: string = process.env.SIGNED_MESSAGE!;
const JWT_EXPIRATION_TIME: string = process.env.JWT_EXPIRATION_TIME!;
const ANTI_SYBIL_NONCE_MINIMUM: string = process.env.ANTI_SYBIL_NONCE_MINIMUM!;
const ANTI_SYBIL_CREATION_TIME_MINIMUM: string = process.env.ANTI_SYBIL_CREATION_TIME_MINIMUM!;

export async function loginParticipantWithAddress(loginRequest: LoginRequest): Promise<LoginResponse> {
    const {address, signature} = loginRequest;
    if ( isSignatureInvalid(address, signature) ){
        console.error('LoginError: Invalid signature');
        return <LoginResponse>{code: -1, message: "Invalid signature"};
    }
    const user = await getParticipant(address);
    if(user){
        const token = createToken(user);
        return <LoginResponse>{code: 0, token: token, message: 'Participant logged in'};
    } else {
        const result = await createParticipantWithAddress(address);
        return result;
    }
}

function isSignatureInvalid(address: string, signature: string): boolean {
    const hash = ethers.utils.hashMessage(SIGNED_MESSAGE);
    const recoveredAddress = ethers.utils.recoverAddress(hash, signature);
    return recoveredAddress !== ethers.utils.getAddress(address);
}

export async function loginParticipantWithGithub(githubUser: GithubUserProfile): Promise<LoginResponse> {
    const createdAt = githubUser._json.created_at;
    const username = githubUser.username;
    const user = await getParticipant(username);
    if (user){
        const token = createToken(user);
        return <LoginResponse>{code: 0, token: token, message: 'Participant logged in'};
    } else {
        const result = await createParticipantWithGithub(username, createdAt);
        return result;
    }
}

function githubCreatedAfterMinimumTime(createdAt: string): boolean {
    const creationTime = new Date(createdAt);
    const minimumTime = new Date(ANTI_SYBIL_CREATION_TIME_MINIMUM);
    return creationTime >= minimumTime;
}

export async function getParticipant(uid: string): Promise<Participant> {
    const db = getFirestore();
    const raw = await db.collection('ceremonies').doc(DOMAIN).collection('participants').doc(uid).get();
    const data = raw.data() as Participant;
    return data;
}

function createToken(user: Participant): string {
    const token = jwt.sign(user, JWT_SECRET_KEY, { expiresIn: JWT_EXPIRATION_TIME});
    return token;
}

async function createParticipantWithAddress(address: string): Promise<LoginResponse> {
     const RPCnode = new ethers.providers.JsonRpcProvider(ETH_RPC_URL);
     // require more than 3 txs, as an anti-sybil mechanism
     const nonce = await RPCnode.getTransactionCount(address);
     const nonceMinimum= Number(ANTI_SYBIL_NONCE_MINIMUM);
     if (nonce <  nonceMinimum){
        console.error('CreateError: Address is too new');
        return <LoginResponse>{code: -2, message: 'Address is too new'};
     }
     try {
        // reverse lookup ENS name
        const ensName = await RPCnode.lookupAddress(address);
        const db = getFirestore();
        const user: Participant = {
            uid: address,
            displayName: ensName || address,
            role: 'PARTICIPANT',
            addedAt: new Date(),
            lastUpdate: new Date(),
        };
        await db.collection('ceremonies').doc(DOMAIN).collection('participants').doc(address).set(user);
        const token = createToken(user);
        return <LoginResponse>{code: 1, token: token, message: 'Participant created'};
     } catch (error) {
        // something went wrong creating the user
        // uid already exists is covered in an upper level (login function)
        throw error;
     }
}

async function createParticipantWithGithub(username: string, createdAt: string): Promise<LoginResponse> {
    if ( githubCreatedAfterMinimumTime(createdAt) ){
        console.error('LoginError: Github profile created after minimum creation time');
        return <LoginResponse>{code: -3, message: 'Github profile created after minimum creation time'};
    }
    try {
        const db = getFirestore();
        const user: Participant = {
            uid: username,
            displayName: username,
            role: 'PARTICIPANT',
            addedAt: new Date(),
            lastUpdate: new Date(),
        };
        await db.collection('ceremonies').doc(DOMAIN).collection('participants').doc(username).set(user);
        const token = createToken(user);
        return <LoginResponse>{code: 1, token: token, message: 'Participant created'};
    } catch (error) {
        // something went wrong creating the user
        // uid already exists is covered in an upper level (login function)
        throw error;
    }
}

export async function authenticateParticipant(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader){
        console.error('LoginError: No authorization header');
        res.sendStatus(401);
    }
    const token = authHeader?.split(" ")[1];
    try {
        const user = jwt.verify(token || '', JWT_SECRET_KEY) as Participant;
        (req as AuthenticatedRequest).user = user;
        return next();
    } catch (error) {
        console.error('AuthenticateError: ', error);
        res.sendStatus(401);
    }
}

