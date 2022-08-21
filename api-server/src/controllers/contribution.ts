import {config as dotEnvConfig} from 'dotenv';
import { getFirestore } from 'firebase-admin/firestore';
import { Participant } from "../models/participant";
import { Ceremony } from '../models/ceremony';

dotEnvConfig();
const DOMAIN: string = process.env.DOMAIN!;

export async function startContribution(participant: Participant, ceremony: Ceremony) {
    try {
        const db = getFirestore();
        const ceremonyDoc = db.collection('ceremonies').doc(DOMAIN);
        // update participant state
        const newParticipant = {
            ...participant,
            lastUpdate: new Date(),
            status: 'RUNNING',
        }
        await ceremonyDoc.collection('participant').doc(participant.uid).set(newParticipant);
        // update ceremony state
        const newCeremony = {
            ...ceremony,
            waiting: ceremony.waiting - 1,
        }
        await ceremonyDoc.set(newCeremony);
        // TODO: start computation
    } catch (error) {
        console.error('UpdateError: ', error);
    }
}