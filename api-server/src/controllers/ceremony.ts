import { getFirestore, Timestamp, WriteResult } from 'firebase-admin/firestore';
import { Request, Response, NextFunction } from 'express';
import {config as dotEnvConfig} from 'dotenv';
import { Ceremony } from '../models/ceremony';


dotEnvConfig();
const DOMAIN: string = process.env.DOMAIN!;
const AVERAGE_TIME_IN_SECONDS = Number(process.env.AVERAGE_TIME_IN_SECONDS!);

export async function createCeremony(ceremony: Ceremony): Promise<WriteResult> {
    const db = getFirestore();
    ceremony.id = DOMAIN;
    ceremony.serverURL = `https://${DOMAIN}`;
    ceremony.ceremonyState = 'WAITING';
    ceremony.lastSummaryUpdate = Timestamp.now();
    ceremony.numParticipants = 0;
    ceremony.complete = 0;
    ceremony.waiting = 0;
    ceremony.currentIndex = 0;
    ceremony.lastValidIndex = 0;
    ceremony.highestQueueIndex = -1;
    ceremony.averageSecondsPerContribution = AVERAGE_TIME_IN_SECONDS;
    const result = await db.collection('ceremonies').doc(DOMAIN).set(ceremony);
    return result;
}

export async function getCeremony(): Promise<Ceremony> {
    const db = getFirestore();
    const raw = await db.collection('ceremonies').doc(DOMAIN).get();
    const data = raw.data() as Ceremony;
    return data;
}

export async function ceremonyExists(req: Request, res: Response, next: NextFunction) {
    const ceremony = await getCeremony();
    if (ceremony){
        return next();
    }
    res.json({code: -1, message: 'There is no ceremony created'});
}