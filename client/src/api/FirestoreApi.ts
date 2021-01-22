import { Ceremony, CeremonyEvent, CeremonyState, 
  Contribution, ContributionState, ContributionSummary, 
  Participant, ParticipantState } from '../types/ceremony';
import firebase from 'firebase/app';
import "firebase/firestore";
import { jsonToCeremony, jsonToContribution } from './ZKPartyApi';

const COMPLETE = "COMPLETE";
const INVALIDATED = "INVALIDATED";
const RUNNING = "RUNNING";
const WAITING = "WAITING";
const PRESELECTION = "PRESELECTION";

const ceremonyConverter: firebase.firestore.FirestoreDataConverter<Ceremony> = {
  toFirestore: (c: Partial<Ceremony>) => {
    var ceremonyData: any = c;

    try {
      if (c.startTime) {
        var start: firebase.firestore.Timestamp = 
         (typeof c.startTime === 'string') ?
          firebase.firestore.Timestamp.fromMillis(Date.parse(c.startTime)) : 
          firebase.firestore.Timestamp.fromDate(c.startTime);
        ceremonyData = {...ceremonyData, startTime: start};
      }
      if (c.endTime) {
        var end: firebase.firestore.Timestamp = 
         (typeof c.endTime === 'string') ?
          firebase.firestore.Timestamp.fromMillis(Date.parse(c.endTime)) : 
          firebase.firestore.Timestamp.fromDate(c.endTime);
        ceremonyData = {...ceremonyData, endTime: end};
      }
    } catch (err) {
      console.error(`Unexpected error parsing dates: ${err.message}`);     
    };
    return {
      ...ceremonyData,
      lastSummaryUpdate: firebase.firestore.Timestamp.now(),
    };
  },
  fromFirestore: (
    snapshot: firebase.firestore.QueryDocumentSnapshot,
    options: firebase.firestore.SnapshotOptions): Ceremony => {
    return jsonToCeremony({id: snapshot.id, ...snapshot.data(options)});
  }
}

const contributionConverter: firebase.firestore.FirestoreDataConverter<ContributionSummary> = {
  toFirestore: (c: ContributionSummary) => {
    if (c.status === COMPLETE) {
      c.hash = c.hash || '#error';
    }
    return c;
  },
  fromFirestore: (
    snapshot: firebase.firestore.QueryDocumentSnapshot,
    options: firebase.firestore.SnapshotOptions): ContributionSummary => {
    return jsonToContribution(snapshot.data(options));
  }
}

export async function addCeremony(ceremony: Ceremony): Promise<string> {
    const db = firebase.firestore();
    try {
      const doc = await db.collection("ceremonies")
        .withConverter(ceremonyConverter)
        .add(ceremony);
  
      console.log(`new ceremony added with id ${doc.id}`);
      return doc.id;
    } catch (e) {
      throw new Error(`error adding ceremony data to firebase: ${e}`);
    }
};

export async function updateCeremony(ceremony: Ceremony): Promise<void> {
  const db = firebase.firestore();
  try {
    await db.collection("ceremonies")
      .withConverter(ceremonyConverter)
      .doc(ceremony.id)
      .set(ceremony, { merge: true });

    console.debug(`ceremony ${ceremony.id} updated`);
  } catch (e) {
    console.error(`ceremony update failed: ${e.message}`);
    throw new Error(`error updating ceremony data: ${e}`);
  }
};

export async function getCeremony(id: string): Promise<Ceremony | undefined> {
  const db = firebase.firestore();
  const doc = await db
    .collection("ceremonies")
    .withConverter(ceremonyConverter)
    .doc(id)
    .get();
  if (doc === undefined) {
    throw new Error("ceremony not found");
  }
  console.log(`getCeremony ${doc.exists}`);
  return doc.data();
}

export const getCeremonies = async (): Promise<Ceremony[]> => {
  const db = firebase.firestore();
  const ceremonySnapshot = await db
      .collection("ceremonies")
      .withConverter(ceremonyConverter)
      .get();

  const ceremonies = await Promise.all(
    ceremonySnapshot.docs.map(async doc => {
      const count = await getCeremonyCount(doc.ref);
      const c: Ceremony = {...doc.data(), ...count}
      return c;
    }));
  return ceremonies;
}

// Counts the waiting and complete contributions for all ceremonies
export const getCeremonyCount = async (ref: firebase.firestore.DocumentReference<Ceremony>): Promise<any> => {
  //const db = firebase.firestore();
  const contribQuery = await ref
    .collection('contributions')
    .withConverter(contributionConverter);

  let query = await contribQuery
    .where('status', '==', 'COMPLETE')
    .get();
  const complete = query.size;
  query = await contribQuery  
    .where('status', '==', 'WAITING')
    .get();
  const waiting = query.size;
  console.debug(`complete ${ref.id} ${complete}`);
  return {complete, waiting};
}

export async function getCeremonyContributions(id: string): Promise<ContributionSummary[]> {
  // Return all contributions, in reverse time order
  const db = firebase.firestore();
  const docSnapshot = await db
    .collection("ceremonies")
    .doc(id)
    .collection("contributions")
    .withConverter(contributionConverter)
    .orderBy("timestamp", "desc")
    .get();
  let contribs = docSnapshot.docs.map(v => v.data());
  return contribs;
}

export const addCeremonyEvent = async (ceremonyId: string, event: CeremonyEvent) => {
    const db = firebase.firestore();

    try {
        const doc = await db
            .doc(`ceremonies/${ceremonyId}`)
            .collection("events")
            .doc();
        
        await doc.set(event);
        console.log(`added event ${doc.id}`);
    } catch (e) { 
      console.warn(`Error adding event: ${e.message}`);
      //throw new Error(`Error adding event: ${e.message}`);
    }
};

export const ceremonyEventListener = async (ceremonyId: string | undefined, callback: (e: any) => void): Promise<()=>void> => {
    const db = firebase.firestore();
    const query = db.collectionGroup("events")
                .where('timestamp', '>', firebase.firestore.Timestamp.now());
    //const query1 = query.where(, '==', ceremonyId);
  
    const unsub = query.onSnapshot(querySnapshot => {
      //console.log(`Ceremony event notified: ${JSON.stringify(querySnapshot)}`);
      querySnapshot.docChanges().forEach(docSnapshot => {
        var event = docSnapshot.doc.data();
        const ceremony = docSnapshot.doc.ref.parent.parent;
        //console.debug(`Event: ${JSON.stringify(event)} ceremony Id: ${ceremony?.id}`);
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
      console.warn(`Error while listening for ceremony events ${err}`);
    });
    return unsub;
};

// Listens for updates to ceremony data, to suit the front page ceremony list.
export const ceremonyListener = async (callback: (c: Ceremony) => void) => {
    const db = firebase.firestore();
    const query = db.collectionGroup("ceremonies")
        .withConverter(ceremonyConverter);
  
    query.onSnapshot(querySnapshot => {
      //console.log(`Ceremony event notified: ${JSON.stringify(querySnapshot)}`);
      querySnapshot.docChanges().forEach(async docSnapshot => {
        if (docSnapshot.type === 'modified' || docSnapshot.type === 'added') {
          console.debug(`Ceremony: ${docSnapshot.doc.id}`);
          getCeremonyCount(docSnapshot.doc.ref).then(count => {
            const ceremony = {...docSnapshot.doc.data(), ...count};
            callback(ceremony);
          });
        }
      });
    }, err => {
      console.log(`Error while listening for ceremony changes ${err}`);
    });
};

// Listens for updates to a ceremony
export const ceremonyUpdateListener = async (id: string, callback: (c: Ceremony) => void): Promise<()=>void> => {
  const db = firebase.firestore();
  const ceremonyData = db.collection("ceremonies")
                .withConverter(ceremonyConverter)
                .doc(id);

  return ceremonyData.onSnapshot(querySnapshot => {
    const c = querySnapshot.data();
    if (c !== undefined) callback(c);
  }, err => {
    console.log(`Error while listening for ceremony changes ${err}`);
  });
};

// Listens for updates to ceremony contributions
export const contributionUpdateListener = async (
    id: string, 
    callback: (c: ContributionSummary,
      type: string,
      oldIndex?: number
      ) => void,
    ): Promise<()=>void> => {
  console.log(`contributionUpdateListener ${id}`);
  const db = firebase.firestore();
  const query = db.collection("ceremonies")
                .doc(id)
                .collection("contributions")
                .withConverter(contributionConverter)
                .orderBy("queueIndex", "asc");
  
  // First time, get all docs
  const querySnapshot = await query.get();
  console.log(`query snapshot ${querySnapshot.size}`);
  querySnapshot.docs.forEach(doc => 
    callback(doc.data(), 'added')
  );

  return query.onSnapshot(querySnapshot => {
    console.log(`contribData snapshot ${querySnapshot.size}`);
    querySnapshot.docChanges().forEach(contrib => {
      callback(contrib.doc.data(), contrib.type, contrib.oldIndex);
    });
  }, err => {
    console.log(`Error while listening for ceremony changes ${err}`);
  });
};


// Listens for updates to eligible ceremonies that a participant may contribute to.
// The first such ceremony found will be returned in the callback
export const ceremonyContributionListener = (participantId: string, isCoordinator: boolean, callback: (c: ContributionState) => void): () => void => {
  console.log(`listening for contributions for ${participantId}`);
  let contributedCeremonies: string[] = [];
  const db = firebase.firestore();
  // Get running ceremonies
  // Coordinator can contribute to ceremonies even if they're not 
  // past start time
  let states = [RUNNING];
  if (isCoordinator) states.push(PRESELECTION, WAITING);
  const query = db.collection("ceremonies")
    .withConverter(ceremonyConverter)
    .where('ceremonyState', 'in', states)
    .orderBy('startTime', 'asc');

  let found = false;
  const unsub = query.onSnapshot(querySnapshot => {
    querySnapshot.forEach(async ceremonySnapshot => {
      // First check cached ceremonies. These are ceremonies that this participant 
      // has already contributed to, so they aren't eligible for selection.
      if (!found) {
        console.debug(`ceremony listener forEach ${ceremonySnapshot.id}`);
        if (!contributedCeremonies.includes(ceremonySnapshot.id)) {
          var ceremony = ceremonySnapshot.data();
          const ceremonyId = ceremonySnapshot.id;
          // Get any contributions for this participant
          const participantQuery = ceremonySnapshot.ref.collection('contributions')
            .withConverter(contributionConverter)
            .where('participantId', '==', participantId)
            .where('status', "!=", WAITING);
          const contSnapshot = await participantQuery.get();
          if (!contSnapshot.empty) {
            // Add to cache
            contributedCeremonies.push(ceremonyId);
            //return true;
          } else if (!found) {
            console.log(`found ceremony ${ceremonyId} to contribute to`);
            found = true;
            // We have a ceremony to contribute to
            let contribution: Contribution = {
              participantId,
              status: WAITING,
              lastSeen: new Date(),
              timeAdded: new Date(),            
            }
            // Allocate a position in the queue
            contribution.queueIndex = await getNextQueueIndex(ceremonyId, participantId);
            // Save the contribution record
            addOrUpdateContribution(ceremonyId, contribution);

            const cs = await getContributionState(
              ceremony,
              contribution
            );

            callback(cs);
          }
        };
      }
    });
    }, err => {
      console.log(`Error while listening for ceremony changes ${err.message}`);
    }
  );

  return unsub;
};

export const getNextQueueIndex = async (ceremonyId: string, participantId: string): Promise<number> => {
  const db = firebase.firestore();
  const query = db.collection("ceremonies")
    .doc(ceremonyId)
    .collection('contributions')
    .withConverter(contributionConverter)
    .orderBy('queueIndex', 'desc');
  
  const snapshot = await query.get();
  if (snapshot.empty) {
    return 1;
  } else {
    const cont = snapshot.docs[0].data();
    // If the last entry is for this participant, reuse it.
    // TODO - should reuse earlier entries if they are still pending
    if (cont.participantId == participantId && cont.queueIndex) {
      return cont.queueIndex;
    }
    return cont.queueIndex ? cont.queueIndex + 1 : 1;
  }
};

export const getContributionState = async (ceremony: Ceremony, contribution: Contribution): Promise<ContributionState> => {
  let contState = {
    ceremony,
    participantId: contribution.participantId,    
    queueIndex: contribution.queueIndex ? contribution.queueIndex : 1,
  };
  // Get currently running contributor's index
  // Get average time per contribution & expected wait time
  const stats = await getCeremonyStats(ceremony.id);

  // expected start time = now + (queueIndex - currentIndex) x av secs per contrib
  const estStartTime = Date.now() + 1000 * ((contState.queueIndex - stats.currentIndex) * stats.averageSecondsPerContribution);
  const cs: ContributionState = {
    ...contState,
    status: WAITING,
    currentIndex: stats.currentIndex,
    lastValidIndex: stats.lastValidIndex,
    averageSecondsPerContribution: stats.averageSecondsPerContribution,
    expectedStartTime: estStartTime,
  }

  return cs;
};

const getCeremonyStats = async (ceremonyId: string): Promise<any> => {
  let contributionStats = {
    currentIndex: 0,
    averageSecondsPerContribution: 0,
    lastValidIndex: 0,
  };
  // For average time calcs
  let totalSecs = 0;
  let numContribs = 0;

  const db = firebase.firestore();
  const query = db.collection("ceremonies")
    .doc(ceremonyId)
    .collection('contributions')
    .withConverter(contributionConverter)
    .orderBy('queueIndex', 'asc');
  
  const snapshot = await query.get();
  snapshot.forEach( docSnapshot => {
    const cont = docSnapshot.data();
    if (cont.status === COMPLETE
        || cont.status === INVALIDATED
        || cont.status === RUNNING) {
      if (cont.queueIndex) {
        contributionStats.currentIndex = cont.queueIndex;
        if (cont.status === COMPLETE) contributionStats.lastValidIndex = cont.queueIndex;
      }

      if (cont.status === COMPLETE && cont.duration) {
        numContribs++;
        totalSecs += cont.duration;
      }
    }
  });

  contributionStats.averageSecondsPerContribution = 
      (numContribs > 0) ? 
        Math.floor(totalSecs / numContribs) 
      : 90; // TODO: calc sensible default based on circuit size

  return contributionStats;
};

// Will refer to the unsub function for the latest ceremony queue listener, if any
// A client may import this and use it to unsubscribe
export var ceremonyQueueListenerUnsub: () => void;

// Listens for ceremony events, to track progress
export const ceremonyQueueListener = async (ceremonyId: string, callback: (c: any) => void) => {
  console.log(`listening for queue activity for ${ceremonyId}`);
  let lastQueueIndex = -1;
  const db = firebase.firestore();
  // Get running ceremonies
  const query = db.collection("ceremonies")
                .doc(ceremonyId)
                .collection("contributions")
                .withConverter(contributionConverter)
                .where("status", "in", [COMPLETE, INVALIDATED]);

  ceremonyQueueListenerUnsub = query.onSnapshot(querySnapshot => {
    //console.debug(`queue listener doc: ${querySnapshot.size}`);
    let found = false;
    querySnapshot.docChanges().forEach(async docData => {
      const cont = docData.doc.data();
      console.debug(`queue listener doc change index: ${cont.queueIndex}`);

      if (cont.queueIndex && cont.queueIndex > lastQueueIndex) {
        lastQueueIndex = cont.queueIndex;
        found = true;
      } 
    });
    if (found) {
      console.debug(`new queue index ${lastQueueIndex+1}`);
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
      .withConverter(contributionConverter)
      .where('participantId', '==', contribution.participantId)
      .limit(1);
    const participantContrib = await eventsQuery.get();
    if (participantContrib.empty) {
      // New contributor
      const doc = await db
          .doc(`ceremonies/${ceremonyId}`)
          .collection("contributions")
          .withConverter(contributionConverter)
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
  } catch (e) {
     console.warn(`Error trying to update participant ${e.message}`);
     //throw new Error(`Error adding participant: ${e.message}`);
  }

};

export const countParticipantContributions = async (participant: string): Promise<number> => {
  const db = firebase.firestore();
  try {
    const contribQuery = db.collectionGroup("contributions")
      .withConverter(contributionConverter)
      .where('participantId', '==', participant)
      .where('status', '==', COMPLETE);
    const res = await contribQuery.get();
    console.debug(`count for ${participant}: ${res.size}`);
    return res.size;
  } catch (e) { throw new Error(`Error getting contribution count: ${e.message}`);}
}

export const resetContributions = async (participant: string): Promise<void> => {
  console.debug(`resetting contribs for ${participant}`);
  let count = 0;
  const db = firebase.firestore();
  try {
    const contribSnapshot = await db.collectionGroup("contributions")
      .withConverter(contributionConverter)
      .where('participantId', '==', participant)
      .get();
    
    contribSnapshot.forEach(async doc => {
      doc.ref.set({participantId: `RESET_${participant.substr(0,5)}...`}, {merge: true});
      count ++;
    });
    console.log(`Reset ${count} contributions`);
  } catch (e) { throw new Error(`Error resetting contribution: ${e.message}`);}
}

export const getUserStatus = async (userId: string): Promise<string> => {
  // userId will contain user Id (e.g. github email) // TODO: , or a signature)
  // If userId is an entry in the coordinators collection, they have coord privs.
  console.log(userId);
  var status = 'USER';
  console.debug(`status for ${userId}`);

  const db = firebase.firestore();
  try {
    const userSnapshot = await db.doc(`coordinators/${userId}`)
      .get();
    
    if (userSnapshot.exists) {
      status = 'COORDINATOR'
    }
  } catch (err) {
    console.warn(`Error getting user status: ${err.message}`);
  }

  // if (status === 'USER' && userId.signature) {
  //   // ecrecover signature. Compare to configured admin address
  //   const adminAddress = process.env.ADMIN_ADDRESS;

  // };
  return status;
};
