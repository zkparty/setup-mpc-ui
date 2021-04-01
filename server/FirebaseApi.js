const admin = require("firebase-admin");
const serviceAccount = require("./firebase_skey.json");

// TODO - put in .env
const DB_URL = "https://trustedsetup-a86f4.firebaseio.com";

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: DB_URL
});

const db = admin.firestore();

const ceremonyConverter = {
  toFirestore: (c) => {
    var ceremonyData = c;

    try {
      if (c.startTime) {
        var start = 
         (typeof c.startTime === 'string') ?
          firebase.firestore.Timestamp.fromMillis(Date.parse(c.startTime)) : 
          firebase.firestore.Timestamp.fromDate(c.startTime);
        ceremonyData = {...ceremonyData, startTime: start};
      }
      if (c.endTime) {
        var end = 
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
    snapshot,
    options) => {
    return jsonToCeremony({id: snapshot.id, ...snapshot.data(options)});
  }
}

const contributionConverter = {
  toFirestore: (c) => {
    if (c.status === COMPLETE) {
      c.hash = c.hash || '#error';
    }
    return c;
  },
  fromFirestore: (
    snapshot,
    options) => {
    return jsonToContribution(snapshot.data(options));
  }
}

function jsonToCeremony(json) {
  // throws if ceremony is malformed

  const {
    lastSummaryUpdate,
    startTime,
    endTime,
    completedAt,
    participants,
    ...rest
  } = json;

  //const start: firebase.firestore.Timestamp = startTime;
  //console.log(`start time ${start ? start.toDate().toLocaleDateString() : '-'}`);

  try {
    let c = 
    {
      ...rest,
      lastSummaryUpdate: tryDate(lastSummaryUpdate),
      startTime: tryDate(startTime, new Date()),
      endTime: tryDate(endTime),
    };
    return c;
  } catch (e) { 
    console.warn(`Error converting ceremony: ${e.message}`);
    throw e;
  }
}

const jsonToContribution = (json) => {
  try {
    return {
      ...json
    }
  } catch (err) {
    console.error(`Error converting contrib: ${err.message}`);
    throw err;
  }
}

async function getFBSummaries() {
  const ceremonySummariesSnapshot = await db.collection("ceremonies").get();
  const fbSummaries = [];
  ceremonySummariesSnapshot.forEach(doc => {
    fbSummaries.push(firebaseCeremonyJsonToSummary({id: doc.id, ...doc.data()}));
  });
  return fbSummaries;
}

async function getFBSummary(id) {
  const doc = await db
    .collection("ceremonies")
    .withConverter(ceremonyConverter)
    .doc(id)
    .get();
  if (!doc.exists) {
    throw new Error("ceremony not found");
  }
  return {id: doc.id, ...doc.data()};
}

async function getFBCeremony(id) {
  const doc = await db
    .collection("ceremonies")
    .doc(id)
    .get();
  if (!doc.exists) {
    throw new Error("ceremony not found");
  }
  console.log(`getFBCeremony ${doc.exists}`);
  return doc.data();
}

async function updateFBSummary(newCeremonySummary) {
  // updates firebase ceremony doc by updating the fields present in newCeremonySummary
  // we never delete fields
  const docRef = await db.collection("ceremonies").doc(newCeremonySummary.id);
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new Error(
      `ceremony with id ${newCeremonySummary.id} does not exist.`
    );
  }
  await docRef.set(
    {
      ...newCeremonySummary,
      lastSummaryUpdate: new Date()
    },
    { merge: true }
  );
}

async function updateFBCeremony(newCeremony) {
  // updates firebase ceremony doc by updating the fields present in newCeremony
  // updates the participants in newCeremony.participants in firebase ceremony's participants subsection (present fields only)
  // we never delete fields
  const docRef = db.collection("ceremonies").doc(newCeremony.id);
  const doc = await docRef.get();
  if (!doc.exists) {
    throw new Error(`ceremony with id ${newCeremony.id} does not exist.`);
  }
  const { participants, ...rest } = newCeremony;
  const summaryUpdatePromise = docRef.set(
    {
      ...rest,
      lastSummaryUpdate: new Date(),
    },
    { merge: true }
  );
}

async function fbCeremonyExists(id) {
  const docRef = db.collection("ceremonies").doc(id);
  return (await docRef.get()).exists;
}

async function addFBCeremony(summaryData) {
  try {
    const doc = await db.collection("ceremonies").add(summaryData);

    console.log(`new ceremony added with id ${doc.id}`);
    return doc.id;
  } catch (e) {
    throw new Error(`error adding ceremony data to firebase: ${e}`);
  }
}

const getContribution = async (ceremonyId, index) => {
  try {
    const query = await db.collection('ceremonies')
      .doc(ceremonyId)
      .collection('contributions')
      .where('queueIndex', '==', index)
      .get();
    
    return query.empty ? {} : query.docs[0].data();
  } catch (e) {
    throw new Error(`error getting contrib: ${e}`);
  }
}

const updateContribution = async (ceremonyId, contribution) => {
  if (!contribution.queueIndex) {
    throw new Error(`Attempting to add or update contribution without queueIndex`);
  }
  try {
    // Existing contributor - update the record
    const indexQuery = db.collection("ceremonies")
      .doc(ceremonyId)
      .collection('contributions')
      .withConverter(contributionConverter)
      .where('queueIndex', '==', contribution.queueIndex)
      .limit(1);
    const contrib = await indexQuery.get();
    if (!contrib.empty) {
      // Update existing contribution
      const doc = contrib.docs[0];
      const oldStatus = doc.get('status');
      // Don't allow this if the contrib has been invalidated.
      if ("INVALIDATED" === oldStatus) {
        console.warn(`Invalid contribution status change: ${oldStatus} to ${contribution.status}. Ignored.`);
      } else {
        await doc.ref.update(contribution);
      }
    }
  } catch (e) { throw new Error(`Error adding/updating contribution summary: ${e.message}`);}

};



async function addParticipant(ceremonyId, participant) {
  participant.messages = [];
  const participantRef = db
    .collection("ceremonyParticipants")
    .doc(ceremonyId)
    .collection("participants")
    .doc(participant.address.toLowerCase());
  return participantRef.set(participant);
}

//TODO - deprecated  - use ceremonies/*/events
async function addCeremonyEvent(event) {
  try {
    const doc = await db
      .collection("ceremonyEvents")
      .add(event);
    console.log(`Event added for ceremony ${event.ceremonyId}. Id: ${doc.id}`);
  } catch (e) {
    throw new Error(`error adding ceremony event to firebase: ${e}`);
  }
};

async function addStatusUpdateEvent(ceremonyId, message) {
  try {
    const event = {
      timestamp: new Date(),
      acknowledged: false,
      eventType: 'STATUS_UPDATE',
      sender: 'SERVER',
      message,
    }
    const doc = await db
      .collection("ceremonies")
      .doc(ceremonyId)
      .collection('events')
      .add(event);
    console.log(`Event added for ceremony ${ceremonyId}. Id: ${doc.id}`);
  } catch (e) {
    throw new Error(`error adding ceremony event to firebase: ${e}`);
  }
}

async function addContributionEvent(ceremonyId, index, eventType, message) {
  try {
    const event = {
      timestamp: new Date(),
      acknowledged: false,
      eventType,
      index,
      sender: 'SERVER',
      message,
    }
    const doc = await db
      .collection("ceremonies")
      .doc(ceremonyId)
      .collection('events')
      .add(event);
    console.debug(`Event added for contrib ${ceremonyId}/${index}. Id: ${doc.id}`);
  } catch (e) {
    throw new Error(`error adding ceremony event to firebase: ${e}`);
  }
}

async function addVerificationToContribution(ceremonyId, index, verification) {
  try {
    const doc = await db
      .collection('ceremonies')
      .doc(ceremonyId)
      .collection('contributions')
      .where('queueIndex', '==', index)
      .get()
    
    if (!doc.empty) {
      doc.docs[0].ref.set(
        { verification },
        { merge: true }
      );
      console.log(`Contribution updated with verification`);
    }
  } catch (err) {
    console.error(`Error updating contribution. ${err.message}`);
  } 
}

function firebaseCeremonyJsonToSummary(json) {
  for (const prop of [
    "lastSummaryUpdate",
    "startTime",
    "endTime",
    "completedAt"
  ]) {
    if (json[prop] !== undefined) {
      json[prop] = json[prop].toDate();
    }
  }
  return json;
}

function firebaseParticipantJsonToParticipant(json) {
  for (const prop of [
    "lastVerified",
    "addedAt",
    "startedAt",
    "completedAt",
    "lastUpdate"
  ]) {
    if (json[prop] !== undefined) {
      json[prop] = json[prop].toDate();
    }
  }
  return json;
}

const ceremonyEventListener = async (circuitFileUpdateHandler, verifyContribution, circuitsList) => {
  console.log(`starting events listener...`);
  try {
    const eventsCollection = db.collectionGroup("events");
    const query = eventsCollection.where('acknowledged', '==', false)
        .where('eventType', 'in', ['CIRCUIT_FILE_UPLOAD', 'PARAMS_UPLOADED']);
    
    const snap = await query.get();
    console.debug(`snap ${snap.size}`);

    query.onSnapshot(querySnapshot => {
      console.log(`Ceremony events notified: ${JSON.stringify(querySnapshot.docChanges().length)}`);
      console.log(`Time: ${(new Date()).toISOString()}`);
      querySnapshot.docChanges().forEach(docSnapshot => {
        console.debug(`changed doc: ${docSnapshot.type}`);
        if (docSnapshot.type !== 'removed') {
          var event = docSnapshot.doc.data();
          const ceremony = docSnapshot.doc.ref.parent.parent;
          console.debug(`Event: ${JSON.stringify(event)} ceremony Id: ${ceremony.id}`);
          if (circuitsList.includes(ceremony.id)) {
            switch (event.eventType) {
              case 'CIRCUIT_FILE_UPLOAD': {
                // Coordinator advises that r1cs file has been uploaded
                // Handle the r1cs file
                console.debug(`Have CIRCUIT_FILE_UPLOAD event`)
                circuitFileUpdateHandler(ceremony.id); // This happens asynchronously
                docSnapshot.doc.ref.update({acknowledged: true});
                break;
              }
              case 'PARAMS_UPLOADED': {
                // Participant advises that contrib file has been uploaded
                // DO the steps to verify it
                console.debug(`Have PARAMS_UPLOADED event`);
                verifyContribution(ceremony.id, event.index);
                docSnapshot.doc.ref.update({acknowledged: true});
                break;
              }
              case 'PREPARED': { break; }
              case 'CREATE': { break; }
            }
          }
      }});
    }, err => {
      console.log(`Error while listening for ceremony events ${err}`);
    });
  } catch (err) {
    console.error(`Error caught in ceremonyEventListener ${err.message}`);
  }
};

module.exports = {
  getFBSummaries,
  getFBSummary,
  getFBCeremony,
  updateFBSummary,
  updateFBCeremony,
  fbCeremonyExists,
  addFBCeremony,
  getContribution,
  addCeremonyEvent,
  ceremonyEventListener,
  addStatusUpdateEvent,
  addContributionEvent,
  addVerificationToContribution,
  updateContribution,
};
