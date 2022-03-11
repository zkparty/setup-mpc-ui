const firebase = require("firebase/app");
const firestore = require("firebase/firestore")
const firebaseConfig =require("./firebaseConfig-test.ts");


import  { addCeremony, addOrUpdateContribution, addCeremonyEvent, contributionUpdateListener, ceremonyQueueListener, ceremonyQueueListenerUnsub } from '../src/api/FirestoreApi';
import { Ceremony, CeremonyEvent, Contribution, ContributionSummary } from '../src/types/ceremony';

/**
 * To test:
 * firebase emulators:start --only firestore
 * then, in a new window:
 * npm run test
 */

const initDb = async (): Promise<any> => {
    // Don't re-init
    if (firebase.apps.length > 0) return firebase.apps[0].firetsore;

    firebase.initializeApp({
        projectId: "demo-ts",
      });

    console.log(`location ${typeof(firebase.firestore)}`);
    var db = await firebase.firestore();
    console.log(`emulator `);
    db.useEmulator("localhost", 8080);

    return db;
}

test('add to db', async () => {
    const db = await initDb();

    const ref = await db.collection('ceremonies').add(
        {
            'id': 'test',
            'name': 'my Name',
            'number': 123
        }
    );
    const snap = await ref.get();

    expect(snap).toBeDefined();

    console.log(`id ${snap.id} ${snap.get('name')}`);
   
});

const createCircuit = async (): Promise<string> => {

        // Create circuit
        const project = {
            name: 'test',
            shortName: 'test',
    
        };
        const ceremony: Ceremony = {
            id: '',
            title: 'test',
            description: 'test circuit',
            ceremonyState: 'RUNNING',
            serverURL: '',
            circuitFileName: '',
            instructions: '',
            github: '',
            homepage: '',
            adminAddr: '',
            lastSummaryUpdate: new Date(),
            startTime: '',
            endTime: '',
            paused: false,
            selectBlock: 0,
            minParticipants: 0,
            maxTier2: 0,
            sequence: 0,
            ceremonyProgress: 0,
            numParticipants: 0,
            complete: 0,
            waiting: 0
        };
    
        return addCeremony(ceremony);        
}

test('join queue', async () => {
    const db = await initDb();

    const cId = await createCircuit();

    // circuit callback
    let lastIndex: number = 0;
    const callback = (indexData: any) => {
        console.log(`cct queue callback ${indexData.currentIndex} ${indexData.lastValidIndex}`);
        if (indexData.currentIndex > 1) lastIndex = indexData.currentIndex;
    };

    await ceremonyQueueListener(cId, callback);

    // Add first few contributions and events

    const contrib: Contribution = {
        participantId: 'p1',
        status: 'WAITING',
        queueIndex: 1,
    }
    await addOrUpdateContribution(cId, contrib);

    contrib.queueIndex = 2;
    contrib.participantId = 'p2';
    await addOrUpdateContribution(cId, contrib);

    let event: CeremonyEvent = {
        index: 1,
        sender: 'USER',
        eventType: 'START_CONTRIBUTION',
        timestamp: new Date(),
        message: 'test event 1',
        acknowledged: false
    }
    await addCeremonyEvent(cId, event);

    event.eventType = 'VERIFIED';
    await addCeremonyEvent(cId, event);

    ceremonyQueueListenerUnsub();

    expect(lastIndex).toBe(2);
});

test('add events', async () => {
    const db = await initDb();

    const cId = await createCircuit();

    // Add first few contributions and events

    const contrib: Contribution = {
        participantId: 'p1',
        status: 'WAITING',
        queueIndex: 1,
    }
    await addOrUpdateContribution(cId, contrib);

    contrib.queueIndex = 2;
    contrib.participantId = 'p2';
    await addOrUpdateContribution(cId, contrib);

    // Callback for event updates
    let updateCount: number = 0;
    const cctUpdated = (
        contrib: ContributionSummary, 
        updateType: string, 
        oldIndex?: number ) => {
            updateCount++;
            console.log(`cctUpdated ${contrib.queueIndex} ${updateType} ${oldIndex || '-'}`);
    };

    const unsub = await contributionUpdateListener(cId, cctUpdated);


    let event: CeremonyEvent = {
        index: 1,
        sender: 'USER',
        eventType: 'JOINED',
        timestamp: new Date(),
        message: 'test event 1',
        acknowledged: false
    }

    await addCeremonyEvent(cId, event);

    event.index = 2;
    await addCeremonyEvent(cId, event);

    event.index = 2;
    await addCeremonyEvent(cId, event);

    
    await unsub();    

    expect(updateCount).toEqual(2);


    
    // 
    // TODO
    // Test join queue 
    //

    // Testing for race conditions:
    // Set latest contributor to RUNNING
    // ** Set up multiple threads
    // ** Join
    // Wait for all threads to complete
    // Test that all queue numbers are different

    
});
