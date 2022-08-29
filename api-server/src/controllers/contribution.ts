import {config as dotEnvConfig} from 'dotenv';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { ImplementationDetails, Transcript } from '../models/contribution';
import { Participant } from "../models/participant";
import { ErrorResponse } from '../models/request';
import { getCeremony } from './ceremony';
import { getQueue } from './queue';


dotEnvConfig();
const DOMAIN: string = process.env.DOMAIN!;
const SECONDS_ALLOWANCE_FOR_START = Number(process.env.SECONDS_ALLOWANCE_FOR_START!);
const SECONDS_ALLOWANCE_TO_COMPUTE = Number(process.env.SECONDS_ALLOWANCE_TO_COMPUTE!);

export async function startContribution(participant: Participant, implementationDetails: ImplementationDetails): Promise<Transcript|ErrorResponse> {
    const ceremony = await getCeremony();
    const uid = participant.uid;
    const queue = await getQueue(uid);
    const db = getFirestore();
    const ceremonyDB = db.collection('ceremonies').doc(DOMAIN);
    if (queue.status !== 'READY' && ceremony.currentIndex === queue.index) {
        return <ErrorResponse>{code: -1, message: 'The participant cannot start the contribution'};
    }
    const now = Timestamp.fromMillis(Date.now() - (SECONDS_ALLOWANCE_FOR_START *1000));
    if ( now > queue.checkingDeadline){
        // must be called within N seconds otherwise next in queue has to start
        await ceremonyDB.update({currentIndex: ceremony.currentIndex + 1});
        await ceremonyDB.collection('queue').doc(uid).update({status: 'ABSENT'});
        return <ErrorResponse>{code: -1, message: 'The time to call this function has expired'};
    }
    await ceremonyDB.collection('queue').doc(uid).update({
        status: 'RUNNING',
        computingDeadline: Timestamp.fromMillis(Date.now() + (SECONDS_ALLOWANCE_TO_COMPUTE * 1000)),
    });
    await saveImplementationDetails(uid, implementationDetails);
    return <Transcript>{'transcript': ceremony.transcript};
}

export async function saveImplementationDetails(uid: string, details: ImplementationDetails): Promise<void> {
    const db = getFirestore();
    await db.collection('ceremonies').doc(DOMAIN).collection('implementations').doc(uid).set(details);
}

export async function completeContribution(participant: Participant, transcript: Transcript): Promise<any> {
    const uid = participant.uid;
    const db = getFirestore();
    // TODO: verify transcript. What happens if it is wrong
    // TODO: append transcript to ceremony
    const ceremony = await getCeremony();
    const ceremonyDB = db.collection('ceremonies').doc(DOMAIN);
    await ceremonyDB.update({
        currentIndex: ceremony.currentIndex + 1,
        complete: ceremony.complete + 1,
    });
    await ceremonyDB.collection('queue').doc(uid).update({status: 'COMPLETED'});
    const queue = await getQueue(uid);
    return queue;
}

export async function abortContribution(participant: Participant){
    const uid = participant.uid;
    const queue = await getQueue(uid);
    if (queue.status === 'WAITING' || queue.status === 'READY' || queue.status === 'RUNNING'){
        const db = getFirestore();
        const ceremony = await getCeremony();
        const ceremonyDB = db.collection('ceremonies').doc(DOMAIN);
        await ceremonyDB.update({
            currentIndex: ceremony.currentIndex + 1,
        });
        await ceremonyDB.collection('queue').doc(uid).update({status: 'LEFT'});
        queue.status = 'LEFT';
        return queue;
    } else {
        return <ErrorResponse>{code: -1, message: 'Queue status indicates that aborting is not possible'};
    }
}