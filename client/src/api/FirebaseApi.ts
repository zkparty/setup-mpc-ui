import { Ceremony, CeremonyEvent, CeremonyState, 
  Contribution, ContributionState, ContributionSummary, 
  Participant, ParticipantState } from './../types/ceremony';
import firebase from 'firebase/app';
import "firebase/firestore";
import { jsonToCeremony } from './ZKPartyApi';

const COMPLETE = "COMPLETE";
const INVALIDATED = "INVALIDATED";

//const serviceAccount = require( 'firebase_skey.json');
export async function addCeremony(ceremony: Ceremony) {
    const db = firebase.firestore();
    try {
      const doc = await db.collection("ceremonies").add(ceremony);
  
      console.log(`new ceremony added with id ${doc.id}`)
      return doc.id;
    } catch (e) {
      throw new Error(`error adding ceremony data to firebase: ${e}`);
    }
};
  
export const addCeremonyEvent = async (ceremonyId: string, event: CeremonyEvent) => {
    const db = firebase.firestore();

    try {
        const doc = await db
            .doc(`ceremonies/${ceremonyId}`)
            .collection("events")
            .doc();
        
        await doc.set(event);
        console.log(`added event ${doc.id}`);
    } catch (e) { throw new Error(`Error adding event: ${e.message}`);}
};

export const ceremonyEventListener = async (ceremonyId: string | undefined, callback: (e: any) => void) => {
    const db = firebase.firestore();
    const query = db.collectionGroup("events");
    //const query = eventsCollection.where(, '==', ceremonyId);
  
    query.onSnapshot(querySnapshot => {
      //console.log(`Ceremony event notified: ${JSON.stringify(querySnapshot)}`);
      querySnapshot.forEach(docSnapshot => {
        var event = docSnapshot.data();
        const ceremony = docSnapshot.ref.parent.parent;
        console.log(`Event: ${JSON.stringify(event)} ceremony Id: ${ceremony?.id}`);
        if (ceremony?.id === ceremonyId) {
            switch (event.eventType) {
                case 'PREPARED': {break;}
                case 'STATUS_UPDATE': {
                    callback(event);
                    break;
                }
            }
        }
      });
    }, err => {
      console.log(`Error while listening for ceremony events ${err}`);
    });
};

// Listens for updates to ceremony data, to suit the front page ceremony list.
export const ceremonyListener = async (callback: (c: Ceremony) => void) => {
    const db = firebase.firestore();
    const query = db.collectionGroup("ceremonies");
  
    query.onSnapshot(querySnapshot => {
      //console.log(`Ceremony event notified: ${JSON.stringify(querySnapshot)}`);
      querySnapshot.forEach(docSnapshot => {
        var ceremony = docSnapshot.data();
        console.log(`Ceremony: ${docSnapshot.id}`);
        callback(jsonToCeremony({id: docSnapshot.id, ...ceremony}));
      });
    }, err => {
      console.log(`Error while listening for ceremony changes ${err}`);
    });
};

// Listens for updates to eligible ceremonies that a participant may contribute to.
// The first such ceremony found will be returned in the callback
export const ceremonyContributionListener = async (participantId: string, callback: (c: ContributionState) => void) => {
  console.log(`listening for contributions for ${participantId}`);
  let contributedCeremonies: string[] = [];
  const db = firebase.firestore();
  // Get running ceremonies
  const query = db.collection("ceremonies")
    .where('ceremonyState', '==', 'RUNNING')
    .orderBy('startTime', 'asc');

  query.onSnapshot(querySnapshot => {
    //TODO docChanges()
    querySnapshot.docs.every(async ceremonySnapshot => {
      // First check cached ceremonies. These are ceremonies that this participant 
      // has already contributed to, so they aren't eligible for selection.
      if (!contributedCeremonies.includes(ceremonySnapshot.id)) {
        var ceremony = ceremonySnapshot.data();
        const ceremonyId = ceremonySnapshot.id;
        //console.log(`Ceremony: ${docSnapshot.id}`);
        // Get any contributions for this participant
        const participantQuery = ceremonySnapshot.ref.collection('contributions')
          .where('participantId', '==', participantId)
          .where('status', "!=", "WAITING");
        const contSnapshot = await participantQuery.get();
        if (!contSnapshot.empty) {
          // Add to cache
          contributedCeremonies.push(ceremonySnapshot.id);
          return true;
        } else {
          console.log(`found ceremony ${ceremonyId} to contribute to`);
          // We have a ceremony to contribute to
          let contribution: Contribution = {
            participantId,
            status: "WAITING",
            lastSeen: new Date(),
            timeAdded: new Date(),            
          }
          // Allocate a position in the queue
          contribution.queueIndex = await getNextQueueIndex(ceremonyId, participantId);
          // Save the contribution record
          addOrUpdateContribution(ceremonyId, contribution);

          const cs = await getContributionState(
            jsonToCeremony({id: ceremonyId, ...ceremony}), 
            contribution);

          callback(cs);
          return false; // exits the every() loop
        }
      };
    });
  }, err => {
    console.log(`Error while listening for ceremony changes ${err}`);
  });
};

export const getNextQueueIndex = async (ceremonyId: string, participantId: string): Promise<number> => {
  const db = firebase.firestore();
  const query = db.collection("ceremonies")
    .doc(ceremonyId)
    .collection('contributions')
    .orderBy('queueIndex', 'desc');
  
  const snapshot = await query.get();
  if (snapshot.empty) {
    return 1;
  } else {
    const cont = snapshot.docs[0];
    // If the last entry is for this participant, reuse it.
    // TODO - should reuse earlier entries if they are still pending
    if (cont.get('participantId') == participantId) {
      return cont.get('queueIndex');
    }
    return cont.get('queueIndex') + 1;
  }
};

export const getContributionState = async (ceremony: Ceremony, contribution: Contribution): Promise<ContributionState> => {
  let contState = {
    ceremony,
    participantId: contribution.participantId,    
    queueIndex: contribution.queueIndex ? contribution.queueIndex : 1,
    //status: "WAITING",
  };
  // Get currently running contributor's index
  // Get average time per contribution & expected wait time
  const stats = await getCeremonyStats(ceremony.id);
  const cs: ContributionState = {
    ...contState,
    status: "WAITING",
    currentIndex: stats.currentIndex,
    averageSecondsPerContribution: stats.averageSecondsPerContribution,
    expectedStartTime: stats.expectedStartTime,
  }

  return cs;
};

const getCeremonyStats = async (ceremonyId: string): Promise<any> => {
  let contributionStats = {
    currentIndex: 0,
    averageSecondsPerContribution: 0,
  };
  const db = firebase.firestore();
  const query = db.collection("ceremonies")
    .doc(ceremonyId)
    .collection('contributions')
    .orderBy('queueIndex', 'asc');
  
  const snapshot = await query.get();
  snapshot.forEach( docSnapshot => {
    const cont = docSnapshot.data();
    if (cont.status === COMPLETE
        || cont.status === INVALIDATED
        || cont.status === "RUNNING") {
      if (cont.queueIndex) contributionStats.currentIndex = cont.queueIndex;
    }
  });

  // Average time calcs
  let totalSecs = 0;
  let numContribs = 0;
  const eventsQuery = db.collection("ceremonies")
    .doc(ceremonyId)
    .collection('events')
    .orderBy('timestamp', 'asc');
  const events = await eventsQuery.get();
  events.forEach( docSnapshot => {
    const event = docSnapshot.data();

  });

  return contributionStats;
};

export var ceremonyQueueListenerUnsub: () => void;

// Listens for ceremony events, to track progress
export const ceremonyQueueListener = async (ceremonyId: string, callback: (c: any) => void) => {
  console.log(`listening for events for ${ceremonyId}`);
  let lastQueueIndex = -1;
  const db = firebase.firestore();
  // Get running ceremonies
  const query = db.collection("ceremonies")
                .doc(ceremonyId)
                .collection("contributions")
                .where("status", "in", [COMPLETE, INVALIDATED]);

  ceremonyQueueListenerUnsub = query.onSnapshot(querySnapshot => {0
    console.log(`queue listener doc: ${querySnapshot.size}`);
    let found = false;
    querySnapshot.docChanges().forEach(async docData => {
      const cont: any = docData.doc.data();
      console.log(`queue listener doc change index: ${cont.queueIndex}`);

      if (cont.queueIndex && cont.queueIndex > lastQueueIndex) {
        lastQueueIndex = cont.queueIndex;
        found = true;
      } 
    });
    if (found) {
      let cs = {
        currentIndex: lastQueueIndex + 1,
      }
      callback(cs);
    }
  });
};

export const addOrUpdateContribution = async (ceremonyId: string, contribution: Contribution) => {
  const db = firebase.firestore();
  try {
    // Existing contributor - update the record
    const eventsQuery = db.collection("ceremonies")
      .doc(ceremonyId)
      .collection('contributions')
      .where('participantId', '==', contribution.participantId)
      .limit(1);
    const participantContrib = await eventsQuery.get();
    if (participantContrib.empty) {
      // New contributor
      const doc = await db
          .doc(`ceremonies/${ceremonyId}`)
          .collection("contributions")
          .doc();
      
      await doc.set(contribution);
      console.log(`added contribution summary ${doc.id}`);
    } else {
      // Update existing contributor
      const doc = participantContrib.docs[0].ref;
      await doc.update(contribution);
    }
  } catch (e) { throw new Error(`Error adding/updating contribution summary: ${e.message}`);}

};

export const addOrUpdateParticipant = async (participant: Participant) => {
  const db = firebase.firestore();
  try {
    participant.online = true;
    participant.lastUpdate = new Date();
    const doc = await db
        .doc(`participants/${participant.uid}`);    
    await doc.set(participant);
    console.log(`updated participant ${doc.id}`);
  } catch (e) { throw new Error(`Error adding participant: ${e.message}`);}

};
