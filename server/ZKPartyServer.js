const { isURL, isGithubURL, isAddr } = require("./utils");
const { getMPCCeremony } = require("./MpcServerApi");
const {
  fbCeremonyExists,
  addFBCeremony,
  getFBSummaries,
  getFBSummary,
  getFBCeremony
} = require("./FirebaseApi");
const { shallowPick } = require("./utils");
const moment = require("moment");

async function getCachedSummaries() {
  // return array of all ceremonies (WITHOUT detailed participant data), from firebase
  return getFBSummaries();
}

async function getCachedSummary(id) {
  return getFBSummary(id);
}

async function getAndUpdateStaleSummaries() {
  // find all ceremonies that haven't been updated in the last 1m, update them, and return their summaries
}

async function getParticipantMessages(ceremonyId, participantAddress) {
  // get all messages and signatures for a participant in a ceremony
}

async function getCachedCeremony(id) {
  // get the cached ceremony data (firebase only) for a ceremony id
  return getFBCeremony(id);
}

async function getandUpdateStaleCeremony(id) {
  // get full ceremony data, from mpc server
}

async function addCeremony(addCeremonyJson) {
  // add a new ceremony. throws if fields are missing or malformed, or if can't connect to MPC server, or if such id already exists
  const addCeremonyData = validateAddCeremonyJson(addCeremonyJson);
  const ceremony = await getMPCCeremony(addCeremonyData.serverURL);

  const firebaseData = {
    ...addCeremonyData,
    ...ceremony,
    lastSummaryUpdate: moment(),
    lastParticipantsUpdate: moment()
  };

  if (await fbCeremonyExists(firebaseData.id)) {
    throw new Error("ceremony with this id already exists");
  }
  await addFBCeremony(firebaseData, ceremony.participants);
}

function validateAddCeremonyJson(addCeremonyJson) {
  const requiredProps = [
    "id",
    "serverURL",
    "description",
    "instructions",
    "github",
    "homepage",
    "adminAddr"
  ];

  const addCeremonyData = shallowPick(addCeremonyJson, requiredProps, []);

  for (const property of requiredProps) {
    addCeremonyData[property] = addCeremonyData[property].toString();
  }

  if (
    !isURL(addCeremonyData.serverURL) ||
    !isGithubURL(addCeremonyData.github) ||
    !isURL(addCeremonyData.homepage) ||
    !isAddr(addCeremonyData.adminAddr)
  ) {
    throw new Error("ceremony creation data is invalid");
  }

  return addCeremonyData;
}

module.exports = {
  getCachedSummaries,
  getCachedSummary,
  getCachedCeremony,
  addCeremony
};
