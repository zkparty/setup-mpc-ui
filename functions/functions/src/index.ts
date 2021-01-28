import * as functions from 'firebase-functions';
import { DocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

//import firebase from 'firebase/app';
import "firebase/firestore";
import firebaseConfig from './firebaseConfig';

const fbAdmin =require('firebase-admin');

fbAdmin.initializeApp(firebaseConfig);

// This watchdog will look for RUNNING and WAITING contributions, then 
// check for the most recent activity (using events) for the ceremony.
// Inactive contributions will be marked INVALIDATED, which will allow
// a new contributor to start.
export const TimeoutWatchdog = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  //functions.logger.debug(`pubsub check ${context.eventType}`);
  const db = fbAdmin.firestore();

  const ceremonySnap = await db.collection('ceremonies')
    .where('ceremonyState', '==', 'RUNNING')
    .get();

  functions.logger.debug(`${ceremonySnap.size} ceremonies running`);

  ceremonySnap.forEach(async (ceremony: DocumentSnapshot) => {
    //functions.logger.debug(` ceremony ${ceremony.id}`);

    // Get last complete contribution. 
    const lastComplete = await ceremony.ref.collection('contributions')
      .orderBy('queueIndex')
      .where('status', 'in', ['COMPLETE', 'INVALIDATED'])
      .limitToLast(1)
      .get();
    //functions.logger.debug(`got lastComplete ${lastComplete.size}`);
    
    const lastCompleteIndex = (lastComplete.empty) ? 0 : lastComplete.docs[0].get('queueIndex');
    //functions.logger.debug(` last complete ${lastCompleteIndex} ${ceremony.id}`);

    // Get the next incomplete contribution. Ignore INVALIDATED.
    const nextContrib = await ceremony.ref.collection('contributions')
      .orderBy('queueIndex')
      .where('queueIndex', '>', lastCompleteIndex)
      .where('status', 'in', ['RUNNING', 'WAITING'])
      .limit(1)
      .get();
    if (nextContrib.empty) {
      functions.logger.debug(`No expiry candidate ${ceremony.id}`);
      return;
    }
    const contrib = nextContrib.docs[0];

    functions.logger.debug(`next contrib ${nextContrib.docs[0].get('queueIndex')}`);

    // Check for excess idle time. INVALIDATE if too long.
    const events = await ceremony.ref
      .collection('events')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();
    let lastSeen = 0;
    if (!events.empty) {
      lastSeen = events.docs[0].get('timestamp').seconds;
      functions.logger.debug(`have events ${lastSeen}`);
    };
    const age = (Date.now()/1000 - lastSeen);
    const status = nextContrib.docs[0].get('status');
    functions.logger.debug(`age ${age} s, status ${status}`);

    let expire = false;
    if (status === 'WAITING') {
      // Expire 3 minutes after due time.
      if (age > 180) {
        functions.logger.info(`expired waiting contribution ${contrib.id}`);
        expire = true;
      }
    } else if (status === 'RUNNING') {
      // Expire after 10 minutes or calculated expected duration, whichever is greater
      const numConstraints: number | undefined = ceremony.get('numConstraints');
      let expectedDur = 600; // seconds
      if (numConstraints) {
        expectedDur = numConstraints * 10 / 1000;
        expectedDur = Math.max(expectedDur, 600);
      }
      expire = (age > expectedDur);
      if (expire) {
        functions.logger.info(`expired running contribution ${contrib.id}. Expected duration is ${expectedDur}`);
      }
    }
    if (expire) {
      functions.logger.info(`Invalidating expired contribution ${contrib.get('queueIndex')} for ${ceremony.get('title')}`)
      await contrib.ref.set({'status': 'INVALIDATED'}, { merge: true });
      // add event
      await ceremony.ref.collection('events')
        .add({
          eventType: 'INVALIDATED',
          index: contrib.get('queueIndex'),
          sender: 'WATCHDOG',
          message: `No activity detected for ${age} seconds for ${status} contribution`,
          timestamp: fbAdmin.firestore.Timestamp.now(),
        });
    }
  });
  
});

// Look for ceremonies that have been prepared and have a start time prior to 
// now, but aren't yet RUNNING. This will kick them off.
export const CeremonyStarter = functions.pubsub.schedule('every 30 minutes').onRun(async (context) => {
  const db = fbAdmin.firestore();
  const snap = await db
    .collection("ceremonies")
    .where('ceremonyState', '==', 'PRESELECTION')
    .where('startTime', '<=', fbAdmin.firestore.Timestamp.now())
    .get();

  snap.forEach(async (ceremony: DocumentSnapshot) => {
      functions.logger.debug(`ceremony ${ceremony.id} is ready to start`);
      await ceremony.ref.set({'ceremonyState': 'RUNNING'}, { merge: true });
      // add event
      await ceremony.ref.collection('events')
        .add({
            eventType: 'SET_RUNNING',
            sender: 'WATCHDOG',
            message: `Ceremony started`,
            timestamp: fbAdmin.firestore.Timestamp.now(),
          });
  });
});
