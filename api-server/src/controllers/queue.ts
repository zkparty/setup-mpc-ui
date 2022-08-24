import {config as dotEnvConfig} from 'dotenv';
import { getFirestore } from 'firebase-admin/firestore';
import { Ceremony } from '../models/ceremony';
import { Participant } from '../models/participant';
import { Queue } from '../models/queue';
import { getCeremony } from './ceremony';

dotEnvConfig();
const DOMAIN: string = process.env.DOMAIN!;

export async function getQueue(uid: string): Promise<Queue> {
    const db = getFirestore();
    const raw = await db.collection('ceremonies').doc(DOMAIN).collection('queue').doc(uid).get();
    const data = raw.data() as Queue;
    return data;
}

export async function joinQueue(participant: Participant){
    const db = getFirestore();
    const uid = participant.uid;
    const ceremony = await getCeremony();
    const index = ceremony.highestQueueIndex + 1;
    const queue: Queue = {
        index: index,
        uid: uid,
        status: 'WAITING',
        expectedTimeToStart: getExpectedTimeToStart(ceremony),
        checkingDeadline: await getCheckingDeadline(),
    };
    const ceremonyRef = db.collection('ceremonies').doc(DOMAIN);
    // set new highest queue index
    await ceremonyRef.update({highestQueueIndex: index});
    // join queue in ceremony
    await ceremonyRef.collection('queue').doc(uid).set(queue);
    return queue;
}

function getExpectedTimeToStart(ceremony: Ceremony): Date {
    const averageTime = ceremony.averageSecondsPerContribution;
    const currentIndex = ceremony.currentIndex;
    const highestIndex = ceremony.highestQueueIndex;

    const remainingParticipants = highestIndex - currentIndex;
    const remainingTime = remainingParticipants * averageTime;
    const remainingTimeMilliseconds = remainingTime * 1000;
    const expectedTimeToStart = new Date( Date.now() + remainingTimeMilliseconds);
    return expectedTimeToStart;
}

async function getCheckingDeadline(): Promise<Date> {
    const ceremony = await getCeremony();
    const expectedTimeToStart = getExpectedTimeToStart(ceremony);
    const halfOfExpectedTime = ( Date.now() - expectedTimeToStart.getTime() ) / 2;
    const anHour = 60 * 60 * 1000; // minutes * seconds * milliseconds
    if (halfOfExpectedTime < anHour){
        return new Date( Date.now() + halfOfExpectedTime );
    } else {
        return new Date( Date.now() + anHour );
    }
}