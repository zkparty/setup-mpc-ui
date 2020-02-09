const moment = require("moment");
const admin = require("firebase-admin");
const serviceAccount = require("./firebase_skey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://zkparty-14974.firebaseio.com"
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
    .collection("ceremonies")
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

async function updateCachedSummary(newCeremonySummary) {}

async function updateCachedCeremony(newCeremony) {}

async function fbCeremonyExists(id) {
  const docRef = db.collection("ceremonies").doc(id);
  return (await docRef.get()).exists;
}

async function addFBCeremony(ceremonyData, participants) {
  try {
    const docRef = db.collection("ceremonies").doc(ceremonyData.id);
    await docRef.set(ceremonyData);
    const participantPromises = [];
    for (const participant of participants) {
      participantPromises.push(addParticipant(ceremonyData.id, participant));
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
    .collection("ceremonies")
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
      json[prop] = moment(json[prop]);
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
      json[prop] = moment(json[prop]);
    }
  }
  return json;
}

module.exports = {
  getFBSummaries,
  getFBSummary,
  getFBCeremony,
  fbCeremonyExists,
  addFBCeremony
};
