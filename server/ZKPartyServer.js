const { isURL, isGithubURL, isAddr } = require("./utils");
const { getMPCCeremony, getMPCSummary } = require("./MpcServerApi");
const {
  fbCeremonyExists,
  addFBCeremony,
  getFBSummaries,
  getFBSummary,
  getFBCeremony,
  updateFBSummary,
  updateFBCeremony
} = require("./FirebaseApi");
const { shallowPick } = require("./utils");

const CeremonyStates = {
  PRESELECTION: "PRESELECTION",
  RUNNING: "RUNNING",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
};

async function getCachedSummaries() {
  // return array of all ceremonies (WITHOUT detailed participant data), from firebase
  const summaries = await getFBSummaries();
  summaries.sort((a, b) => {
    let aProgress = a.ceremonyProgress;
    if (a.ceremonyState === CeremonyStates.PRESELECTION) {
      aProgress = -1;
    }
    let bProgress = b.ceremonyProgress;
    if (b.ceremonyState === CeremonyStates.PRESELECTION) {
      bProgress = -1;
    }
    return aProgress - bProgress;
  });
  return summaries;
}

async function getCachedSummary(id) {
  return getFBSummary(id);
}

async function getAndUpdateStaleSummaries() {
  // find all ceremonies that haven't been updated in the last 5m, update them, and then return all summaries

  // TODO: put a lock on ceremonies that are already being updated / already have requests sent out!
  const summaries = await getFBSummaries();
  const updatePromises = [];
  for (let i = 0; i < summaries.length; i += 1) {
    let summary = summaries[i];
    if (
      summary.lastSummaryUpdate &&
      new Date() - summary.lastSummaryUpdate > 60 * 1000
    ) {
      updatePromises.push(
        getMPCSummary(summary.serverURL)
          .then(newSummary => {
            delete newSummary.sequence; // otherwise we will advance sequence without having updated participants properly!
            return updateFBSummary({ ...newSummary, id: summary.id });
          })
          .then(() => {
            return getFBSummary(summary.id);
          })
          .then(summary => {
            summaries[i] = summary;
          })
          .catch(err => {
            console.error(
              `error updating ceremony summary with id ${summary.id}: ${err}`
            );
          })
      );
    }
  }
  await Promise.all(updatePromises);
  summaries.sort((a, b) => {
    let aProgress = a.ceremonyProgress;
    if (a.ceremonyState === CeremonyStates.PRESELECTION) {
      aProgress = -1;
    }
    let bProgress = b.ceremonyProgress;
    if (b.ceremonyState === CeremonyStates.PRESELECTION) {
      bProgress = -1;
    }
    return aProgress - bProgress;
  });
  return summaries;
}

async function getParticipantMessages(ceremonyId, participantAddress) {
  // get all messages and signatures for a participant in a ceremony
}

async function getCachedCeremony(id) {
  // get the cached ceremony data (firebase only) for a ceremony id
  return getFBCeremony(id);
}

async function getAndUpdateStaleCeremony(id) {
  // get full ceremony data, from mpc server
  const summary = await getFBSummary(id);
  console.log(`getAndUpdateStaleCeremony - got summary`);
  // TODO - get server status - or make this push updates??
  //const mpcCeremony = await getMPCCeremony(summary.serverURL, summary.sequence);
  //await updateFBCeremony({ ...mpcCeremony, id });
  //const updatedCeremony = await getFBCeremony(id);
  //return updatedCeremony;
  return summary;
}

async function addCeremony(addCeremonyJson) {
  // add a new ceremony. throws if fields are missing or malformed, or if can't connect to MPC server, or if such id already exists
  const addCeremonyData = validateAddCeremonyJson(addCeremonyJson);
  addCeremonyData.ceremonyState = CeremonyStates.PRESELECTION;
  addCeremonyData.paused = false;
  addCeremonyData.ceremonyProgress = 0;
  //const ceremony = await getMPCCeremony(addCeremonyData.serverURL);
  //const { participants, ...rest } = ceremony;

  //const summaryData = {
  //  ...addCeremonyData,
  //  ...rest
  //};

  //if (await fbCeremonyExists(summaryData.id)) {
  //  throw new Error("ceremony with this id already exists");
  //}
  const id = await addFBCeremony(addCeremonyData);
  return id;
}

const parseDate = (dateString) => {
  try {
    return Date.parse(dateString);
  } catch (err) {
    console.log(`Error parsing date: ${err.message}`);
  };
}

function validateAddCeremonyJson(addCeremonyJson) {
  const requiredProps = [
    "title",
    "description",
  ];

  const optionalProps = [
    "circuitFileName",
    "startTime",
    "endTime",
    "minParticipants", 
    "ceremonyState",
    "paused",
    "selectBlock",
    "ceremonyProgress",
  ];

  if (addCeremonyJson.startTime) { addCeremonyJson.startTime = parseDate(addCeremonyJson.startTime); };
  if (addCeremonyJson.endTime) { addCeremonyJson.endTime = parseDate(addCeremonyJson.endTime); };

  const addCeremonyData = shallowPick(addCeremonyJson, requiredProps, optionalProps);

  for (const property of requiredProps) {
    addCeremonyData[property] = addCeremonyData[property].toString();
  }

  //if (
    //!isURL(addCeremonyData.serverURL) ||
    //!isGithubURL(addCeremonyData.github) ||
    //!isURL(addCeremonyData.homepage) ||
    //!isAddr(addCeremonyData.adminAddr)
  //) {
  //  throw new Error("ceremony creation data is invalid");
  //}

  return addCeremonyData;
}

const getUserStatus = (userId) => {
  // userId will contain either user (e.g. github email, or a signature)
  console.log(userId);
  var status = 'USER';
  console.log(`status for ${userId.userid} - ${process.env.COORDINATOR_USERS}`);
  if (userId.userid) {
    if (process.env.COORDINATOR_USERS.indexOf(userId.userid) > 0) {
      status = 'COORDINATOR'
    };
  };
  if (status === 'USER' && userId.signature) {
    // ecrecover signature. Compare to configured admin address
    const adminAddress = process.env.ADMIN_ADDRESS;

  };
  return status;
};

module.exports = {
  getCachedSummaries,
  getCachedCeremony,
  getAndUpdateStaleSummaries,
  getAndUpdateStaleCeremony,
  addCeremony,
  CeremonyStates,
  getUserStatus,
};
