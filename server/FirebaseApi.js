const admin = require("firebase-admin");
const serviceAccount = require("./firebase_skey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://trustedsetup-a86f4.firebaseio.com"
});

const db = admin.firestore();

async function getFBSummaries() {
  const ceremonySummariesSnapshot = await db.collection("ceremonies").get();
  const fbSummaries = [];
  ceremonySummariesSnapshot.forEach(doc => {
    fbSummaries.push(firebaseCeremonyJsonToSummary(doc.data()));
  });
  return fbSummaries;
}

async function getFBSummary(id) {
  const doc = await db
    .collection("ceremonies")
    .doc(id)
    .get();
  if (!doc.exists) {
    throw new Error("ceremony not found");
  }
  return firebaseCeremonyJsonToSummary(doc.data());
}

async function getFBCeremony(id) {
  const doc = await db
    .collection("ceremonies")
    .doc(id)
    .get();
  if (!doc.exists) {
    throw new Error("ceremony not found");
  }
  const missingParticipants = firebaseCeremonyJsonToSummary(doc.data());
  const participants = [];
  const participantsSnapshot = await db
    .collection("ceremonyParticipants")
    .doc(id)
    .collection("participants")
    .orderBy("position")
    .get();
  participantsSnapshot.forEach(doc => {
    participants.push(firebaseParticipantJsonToParticipant(doc.data()));
  });
  const ceremony = {
    ...missingParticipants,
    participants
  };
  return ceremony;
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
      lastParticipantsUpdate: new Date()
    },
    { merge: true }
  );
  const participantUpdatesPromises = [];
  for (const participant of newCeremony.participants) {
    const participantDocRef = db
      .collection("ceremonyParticipants")
      .doc(newCeremony.id)
      .collection("participants")
      .doc(participant.address.toLowerCase());
    participantUpdatesPromises.push(
      participantDocRef.set(participant, { merge: true })
    );
  }
  await Promise.all([summaryUpdatePromise, ...participantUpdatesPromises]);
}

async function fbCeremonyExists(id) {
  const docRef = db.collection("ceremonies").doc(id);
  return (await docRef.get()).exists;
}

async function addFBCeremony(summaryData, participants) {
  try {
    const docRef = db.collection("ceremonies").doc(summaryData.id);
    await docRef.set({
      ...summaryData,
      lastSummaryUpdate: new Date(),
      lastParticipantsUpdate: new Date()
    });
    const ceremonyParticipantsDocRef = db
      .collection("ceremonyParticipants")
      .doc(summaryData.id);
    await ceremonyParticipantsDocRef.set({
      id: summaryData.id
    });
    const participantPromises = [];
    for (const participant of participants) {
      participantPromises.push(addParticipant(summaryData.id, participant));
    }
    await Promise.all(participantPromises);
    return;
  } catch (e) {
    throw new Error(`error adding ceremony data to firebase: ${e}`);
  }
}

async function addParticipant(ceremonyId, participant) {
  participant.messages = [];
  const participantRef = db
    .collection("ceremonyParticipants")
    .doc(ceremonyId)
    .collection("participants")
    .doc(participant.address.toLowerCase());
  return participantRef.set(participant);
}

function firebaseCeremonyJsonToSummary(json) {
  for (const prop of [
    "lastParticipantsUpdate",
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

module.exports = {
  getFBSummaries,
  getFBSummary,
  getFBCeremony,
  updateFBSummary,
  updateFBCeremony,
  fbCeremonyExists,
  addFBCeremony
};
