import * as functions from 'firebase-functions';
import { QueryDocumentSnapshot } from 'firebase-functions/lib/providers/firestore';

import firebase from 'firebase/app';
import { ContributionSummary } from './types/ceremony';
import { jsonToContribution } from './ZKPartyApi';


const fbAdmin = require('firebase-admin');

const COMPLETE = "COMPLETE";
const INVALIDATED = "INVALIDATED";
const RUNNING = "RUNNING";
const WAITING = "WAITING";

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


// Calculate summary stats for each circuit. Save them in the circuit record.
// These functions are specified on a per-circuit basis because a bulk function
// would exceed time limits for functions (to be confirmed)
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
export const CircuitSummary16 = functions.pubsub.schedule('every 5 minutes').onRun(
  async (context) => DoCircuitSummary(16)
);
export const CircuitSummary17 = functions.pubsub.schedule('every 5 minutes').onRun(
  async (context) => DoCircuitSummary(17)
);

const DoCircuitSummary = async (i: number) => {
    const db = fbAdmin.firestore();
    const snap = await db
      .collection("ceremonies")
      .where('ceremonyState', '==', RUNNING)
      .get();
  
      
    //snap.docs.forEach(async (doc: { data: () => any; }, i: number) => {
      //if (i>1) return;
      const cDoc = snap.docs[i];
      if (!cDoc) {
        functions.logger.info(`No circuit found for index ${i}`);
        return;
      }
      const circuit = cDoc.data();
      
      //snap.forEach(async (circuit: DocumentSnapshot) => {
      functions.logger.debug(`summarising circuit ${circuit.id}`);
      // Get stats
      const stats = await getCeremonyStats(circuit.id);
  
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

