import { getFirestore, WriteResult } from 'firebase-admin/firestore';
import {config as dotEnvConfig} from 'dotenv';
import { Ceremony } from '../models/ceremony';

dotEnvConfig();
const domain: string = process.env.DOMAIN!;

export async function createCeremony(ceremony: Ceremony): Promise<WriteResult> {
    const db = getFirestore();
    ceremony.id = domain;
    ceremony.serverURL = `https://${domain}`;
    ceremony.ceremonyState = 'WAITING';
    ceremony.lastSummaryUpdate = new Date;
    ceremony.numParticipants = 0;
    ceremony.complete = 0;
    ceremony.waiting = 0;
    ceremony.currentIndex = 0;
    ceremony.lastValidIndex = 0;
    ceremony.highestQueueIndex = 0;
    const result = await db.collection('ceremonies').doc(domain).set(ceremony);
    return result;
}

export async function getCeremony(): Promise<Ceremony> {
    const db = getFirestore();
    const raw = await db.collection('ceremonies').doc(domain).get();
    const data = raw.data() as Ceremony;
    return data || {};
}