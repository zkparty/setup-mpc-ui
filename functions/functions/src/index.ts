import * as functions from 'firebase-functions';
import { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

import firebase from 'firebase/app';
//import "firebase/firestore";
import firebaseConfig from './firebaseConfig';
import { ContributionSummary } from './types/ceremony';
import { jsonToContribution } from './ZKPartyApi';


const fbAdmin =require('firebase-admin');

fbAdmin.initializeApp(firebaseConfig);

const COMPLETE = "COMPLETE";
const INVALIDATED = "INVALIDATED";
const RUNNING = "RUNNING";
const WAITING = "WAITING";
//const PRESELECTION = "PRESELECTION";
//const VERIFIED = "VERIFIED";
//const VERIFY_FAILED = "VERIFY_FAILED";
//const ABORTED = "ABORTED";

const contributionConverter = {
  toFirestore: (c: ContributionSummary) => {
    if (c.status === COMPLETE) {
      c.hash = c.hash || '#error';
    }
    return c;
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: firebase.firestore.SnapshotOptions): ContributionSummary => {
    return jsonToContribution(snapshot.data());
  },
}


// This watchdog will look for RUNNING and WAITING contributions, then 
// check for the most recent activity (using events) for the circuit.
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
      .get();
    if (nextContrib.empty) {
      //functions.logger.debug(`No expiry candidate ${ceremony.id}`);
      return;
    }
    const contrib = nextContrib.docs[0];
    const laterContribsFound: boolean = (nextContrib.size > 1);
    const waiterIndex = contrib.get('queueIndex');

    //functions.logger.debug(`next contrib ${nextContrib.docs[0].get('queueIndex')}`);

    // Check for excess idle time. INVALIDATE if too long.
    const events = await ceremony.ref
      .collection('events')
      .orderBy('timestamp', 'desc')
      .where('index', '==', waiterIndex)
      .limit(1)
      .get();
    let lastSeen = contrib.createTime.toMillis()/1000;
    if (!events.empty) {
      lastSeen = events.docs[0].get('timestamp').seconds;
      //functions.logger.debug(`have events ${lastSeen}`);
    };
    const age = (Date.now()/1000 - lastSeen);
    const status = contrib.get('status');
    functions.logger.debug(`age ${age} s, status ${status}`);

    let expire = false;
    const DEFAULT_MAX_RUNNING_DURATION = 600;
    let expectedDur = DEFAULT_MAX_RUNNING_DURATION; // seconds
    const MAX_WAIT_SECONDS = 180;
    if (status === 'WAITING') {
      // Expire 3 minutes after due time if anyone else is waiting
      if (age > MAX_WAIT_SECONDS && laterContribsFound) {
        functions.logger.info(`expired waiting contribution ${contrib.id} ${waiterIndex}. ${nextContrib.size} waiting`);
        expire = true;
      }
    } else if (status === 'RUNNING') {
      // Expire after 10 minutes or calculated expected duration, whichever is greater
      const numConstraints: number | undefined = ceremony.get('numConstraints');
      if (numConstraints) {
        expectedDur = numConstraints * 10 / 1000;
      }
      expectedDur = Math.max(expectedDur, DEFAULT_MAX_RUNNING_DURATION);
      expire = (age > expectedDur && laterContribsFound);
      if (expire) {
        functions.logger.info(`Expired running contribution ${contrib.id}. Expected duration is ${expectedDur} seconds`);
      }
    }
    if (expire) {
      functions.logger.info(`Invalidating expired contribution ${waiterIndex} for ${ceremony.get('title')}`);
      await contrib.ref.set({'status': 'INVALIDATED'}, { merge: true });
      // add event
      await ceremony.ref.collection('events')
        .add({
          eventType: 'INVALIDATED',
          index: waiterIndex,
          sender: 'WATCHDOG',
          message: `No activity detected for ${Math.floor(age)} seconds for ${status} contribution. Max ${Math.floor(expectedDur)} secs.`,
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


// Calculate summary stats for each circuit. Save them in the circuit record.
export const CircuitSummary0 = functions.pubsub.schedule('every 5 minutes').onRun(
  async (context) => DoCircuitSummary(0)
);
export const CircuitSummary1 = functions.pubsub.schedule('every 5 minutes').onRun(
  async (context) => DoCircuitSummary(1)
);
export const CircuitSummary2 = functions.pubsub.schedule('every 5 minutes').onRun(
  async (context) => DoCircuitSummary(2)
);
export const CircuitSummary3 = functions.pubsub.schedule('every 5 minutes').onRun(
  async (context) => DoCircuitSummary(3)
);
export const CircuitSummary4 = functions.pubsub.schedule('every 5 minutes').onRun(
  async (context) => DoCircuitSummary(4)
);
export const CircuitSummary5 = functions.pubsub.schedule('every 5 minutes').onRun(
  async (context) => DoCircuitSummary(5)
);
export const CircuitSummary6 = functions.pubsub.schedule('every 5 minutes').onRun(
  async (context) => DoCircuitSummary(6)
);
export const CircuitSummary7 = functions.pubsub.schedule('every 5 minutes').onRun(
  async (context) => DoCircuitSummary(7)
);
export const CircuitSummary8 = functions.pubsub.schedule('every 5 minutes').onRun(
  async (context) => DoCircuitSummary(8)
);
export const CircuitSummary9 = functions.pubsub.schedule('every 5 minutes').onRun(
  async (context) => DoCircuitSummary(9)
);
export const CircuitSummary10 = functions.pubsub.schedule('every 5 minutes').onRun(
  async (context) => DoCircuitSummary(10)
);
export const CircuitSummary11 = functions.pubsub.schedule('every 5 minutes').onRun(
  async (context) => DoCircuitSummary(11)
);
export const CircuitSummary12 = functions.pubsub.schedule('every 5 minutes').onRun(
  async (context) => DoCircuitSummary(12)
);
export const CircuitSummary13 = functions.pubsub.schedule('every 5 minutes').onRun(
  async (context) => DoCircuitSummary(13)
);
export const CircuitSummary14 = functions.pubsub.schedule('every 5 minutes').onRun(
  async (context) => DoCircuitSummary(14)
);
export const CircuitSummary15 = functions.pubsub.schedule('every 5 minutes').onRun(
  async (context) => DoCircuitSummary(15)
);

const DoCircuitSummary = async (i: number) => {
    const db = fbAdmin.firestore();
    const snap = await db
      .collection("ceremonies")
      .where('ceremonyState', '==', 'RUNNING')
      .get();
  
      
    //snap.docs.forEach(async (doc: { data: () => any; }, i: number) => {
      //if (i>1) return;
      const cDoc = snap.docs[i];
      const circit = cDoc.data();
      
      //snap.forEach(async (circuit: DocumentSnapshot) => {
      functions.logger.debug(`summarising circuit ${circit.id}`);
      // Get stats
      const stats = await getCeremonyStats(circit.id);
  
      // update circuit record
      await cDoc.ref.update({...stats});
      functions.logger.info(`stats: ${JSON.stringify(stats)}`);
    //});
}

const getCeremonyStats = async (ceremonyId: string): Promise<any> => {
  //functions.logger.debug(`getCeremonyStats ${ceremonyId}`);
  const contributionStats = {
    currentIndex: 0,
    averageSecondsPerContribution: 0,
    lastValidIndex: 0,
    complete: 0,
    waiting: 0,
    transcript: '',
  };
  // For average time calcs
  let totalSecs = 0;
  let numContribs = 0;
  let durationContribs = 0;

  const db = fbAdmin.firestore();
  const ceremony = db.collection("ceremonies")
    .doc(ceremonyId);
  const contribQuery: firebase.firestore.Query<ContributionSummary> = ceremony
    .collection('contributions')
    .withConverter(contributionConverter)
    .orderBy('queueIndex', 'asc');
  
  const ceremonySnap = await ceremony.get();
  const snapshot = await contribQuery.get();
  //functions.logger.info(`contribs: ${snapshot.size}`);
  snapshot.forEach( (docSnapshot:firebase.firestore.QueryDocumentSnapshot<ContributionSummary>) => {
    const cont = docSnapshot.data();
    if (cont.status === COMPLETE
        || cont.status === INVALIDATED
        || cont.status === RUNNING) {
      if (cont.queueIndex) {
        contributionStats.currentIndex = cont.queueIndex;
        if (cont.status === COMPLETE && cont.verification) {
          contributionStats.lastValidIndex = cont.queueIndex;
          contributionStats.transcript = cont.verification;
        }
      }

      if (cont.status === COMPLETE) {
        numContribs++;
        if (cont.duration) {
          durationContribs++;
          totalSecs += cont.duration;
        }
      }
    } else if (cont.status === WAITING) {
      contributionStats.waiting ++;
    }
  });

  contributionStats.averageSecondsPerContribution = 
      (durationContribs > 0) ? 
        Math.floor(totalSecs / durationContribs) 
      : ceremonySnap.get('numConstraints') * 5 / 1000; // calc sensible default based on circuit size

  contributionStats.complete = numContribs;

  return contributionStats;
};

