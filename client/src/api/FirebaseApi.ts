import { Ceremony, CeremonyEvent, CeremonyState, 
  Contribution, ContributionState, ContributionSummary, 
  Participant, ParticipantState } from './../types/ceremony';
import firebase from 'firebase/app';
import "firebase/firestore";
import { jsonToCeremony } from './ZKPartyApi';

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

// Listens for updates to eligible ceremonies that a participant may contribut to.
// The first such ceremony found will be returned in the callback
export const ceremonyContributionListener = async (participantId: string, callback: (c: ContributionState) => void) => {
  let contributedCeremonies: string[] = [];
  const db = firebase.firestore();
  // Get running ceremonies
  const query = db.collection("ceremonies")
    .where('ceremonyState', '==', 'RUNNING')
    .orderBy('startTime', 'asc');

  query.onSnapshot(querySnapshot => {
    querySnapshot.docs.every(async ceremonySnapshot => {
      // First check cached ceremonies
      if (!contributedCeremonies.includes(ceremonySnapshot.id)) {
        var ceremony = ceremonySnapshot.data();
        const ceremonyId = ceremonySnapshot.id;
        //console.log(`Ceremony: ${docSnapshot.id}`);
        // Get any contributions for this participant
        const participantQuery = ceremonySnapshot.ref.collection('contributions')
          .where('participantId', '==', participantId);
        const contSnapshot = await participantQuery.get();
        if (!contSnapshot.empty) {
          // Add to cache
          contributedCeremonies.push(ceremonySnapshot.id);
          return true;
        } else {
          // We have a ceremony to contribute to
          let contribution: Contribution = {
            participantId,
            status: ParticipantState.WAITING,
            lastSeen: new Date(),
            timeAdded: new Date(),            
          }
          // Allocate a position in the queue
          contribution.queueIndex = await getNextQueueIndex(ceremonyId);
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

export const getNextQueueIndex = async (ceremonyId: string): Promise<number> => {
  const db = firebase.firestore();
  const query = db.collection("ceremonies")
    .doc(ceremonyId)
    .collection('contributions')
    .orderBy('queueIndex', 'desc')
    .limit(1);
  
  const snapshot = await query.get();
  if (snapshot.empty) {
    return 1;
  } else {
    const lastCont = snapshot.docs[0];
    return lastCont.get('queueIndex') + 1;
  }
};

export const getContributionState = async (ceremony: Ceremony, contribution: Contribution): Promise<ContributionState> => {
  let contState = {
    ceremony,
    participantId: contribution.participantId,    
    queueIndex: contribution.queueIndex ? contribution.queueIndex : 1,
    status: ParticipantState.WAITING,
  };
  // Get current contributor's index
  // Get average time per contribution & expected wait time
  const stats = await getCeremonyStats(ceremony.id);
  const cs: ContributionState = {
    ...contState,
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
    const cont = docSnapshot.data() as Contribution;
    if (cont.status === ParticipantState.COMPLETE
        || cont.status === ParticipantState.INVALIDATED
        || cont.status === ParticipantState.RUNNING) {
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

export const addOrUpdateContribution = async (ceremonyId: string, contribution: Contribution) => {
  const db = firebase.firestore();
  try {
    const doc = await db
        .doc(`ceremonies/${ceremonyId}`)
        .collection("contributions")
        .doc();
    
    await doc.set(contribution);
    console.log(`added contribution summary ${doc.id}`);
  } catch (e) { throw new Error(`Error adding contribution summary: ${e.message}`);}

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
