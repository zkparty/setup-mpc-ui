const firebase = require("firebase/app");
const firestore = require("firebase/firestore")
const firebaseConfig =require("./firebaseConfig-test.ts");


import  { addCeremony, addOrUpdateContribution, addCeremonyEvent } from '../src/api/FirestoreApi';
import { Ceremony, CeremonyEvent, Contribution } from '../src/types/ceremony';

/**
 * To test:
 * firebase emulators:start --only firestore
 * then, in a new window:
 * npm run test
 */

test('add 1+1', () => {
    let a = 1+1;
    expect(a).toBe(2);
});

test('init db', async () => {
    firebase.initializeApp({
        projectId: "demo-ts",
      });

    console.log(`location ${typeof(firebase.firestore)}`);
    var db = await firebase.firestore();
    //if (location.hostname === "localhost") {
        console.log(`emulator `);
        db.useEmulator("localhost", 8080);
    //}
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

    // Create ceremony
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

    const cId = await addCeremony(ceremony);
    // Add first few contributions and events

    const contrib: Contribution = {
        participantId: 'p1',
        status: 'WAITING',
        queueIndex: 1,
    }
    await addOrUpdateContribution(cId, contrib);

    const event: CeremonyEvent = {
        index: 1,
        sender: 'USER',
        eventType: 'JOINED',
        timestamp: new Date(),
        message: 'test event 1',
        acknowledged: false
    }

    await addCeremonyEvent(cId, event);

    // 
    // TODO
    // Testing for race conditions:
    // Set latest contributor to RUNNING
    // ** Set up multiple threads
    // ** Join
    // Wait for all threads to complete
    // Test that all queue numbers are different

    
});
