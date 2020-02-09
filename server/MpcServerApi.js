const axios = require("axios").default;
const moment = require("moment");
const { shallowPick } = require("./utils");

async function getMPCSummary(url) {
  // gets an mpcState object from an mpc server and transforms it into a partial Ceremony object (containing all non-firebase fields)
  // throws if request fails, or if response does not conform to expectation
  const response = await axios.get(url + "/api/state-summary", {
    timeout: 2000
  });
  return stateSummaryJsonToCeremonyPartial(response.data);
}

async function getMPCCeremony(url) {
  // gets an mpcState object from an mpc server and transforms it into a partial Ceremony object (containing all non-firebase fields)
  // throws if request fails, or if response does not conform to expectation
  const response = await axios.get(url + "/api/state", {
    timeout: 2000
  });
  return stateJsonToCeremonyPartial(response.data);
}

function stateSummaryJsonToCeremonyPartial(json) {
  // returns a json with all fields that are not firebase-only
  // DOES NOT include full participants data
  // throws if json is missing required fields

  const requiredCeremonyFields = [
    "ceremonyState",
    "startTime",
    "endTime",
    "paused",
    "selectBlock",
    "minParticipants",
    "maxTier2",
    "sequence",
    "participants",
    "numParticipants",
    "ceremonyProgress"
  ];
  const optionalCeremonyFields = ["completedAt"];
  const ceremonyPartial = shallowPick(
    json,
    requiredCeremonyFields,
    optionalCeremonyFields
  );

  // cast string -> moment
  for (let castToMoment of ["startTime", "endTime", "completedAt"]) {
    if (ceremonyPartial[castToMoment] !== undefined) {
      ceremonyPartial[castToMoment] = moment(ceremonyPartial[castToMoment]);
    }
  }

  return ceremonyPartial;
}

function stateJsonToCeremonyPartial(json) {
  // returns a json with all fields that are not firebase-only
  // DOES include full participants data
  // throws if json is missing required fields

  // get and validate all the relevant fields
  const requiredCeremonyFields = [
    "ceremonyState",
    "startTime",
    "endTime",
    "paused",
    "selectBlock",
    "minParticipants",
    "maxTier2",
    "sequence",
    "participants"
  ];
  const optionalCeremonyFields = ["completedAt"];
  const ceremonyPartial = shallowPick(
    json,
    requiredCeremonyFields,
    optionalCeremonyFields
  );
  for (let i = 0; i < ceremonyPartial.participants.length; i += 1) {
    let participant = ceremonyPartial.participants[i];
    const requiredParticipantFields = [
      "address",
      "state",
      "runningState",
      "position",
      "priority",
      "tier",
      "verifyProgress",
      "addedAt",
      "online",
      "sequence",
      "transcripts",
      "computeProgress"
    ];
    const optionalParticipantFields = [
      "lastVerified",
      "startedAt",
      "completedAt",
      "error",
      "lastUpdate",
      "location",
      "invalidateAfter"
    ];
    ceremonyPartial.participants[i] = shallowPick(
      participant,
      requiredParticipantFields,
      optionalParticipantFields
    );
    participant = ceremonyPartial.participants[i];
    for (let i = 0; i < participant.transcripts.length; i += 1) {
      const transcript = participant.transcripts[i];
      const requiredTranscriptFields = [
        "state",
        "num",
        "size",
        "downloaded",
        "uploaded"
      ];
      participant.transcripts[i] = shallowPick(
        transcript,
        requiredTranscriptFields,
        []
      );
    }
  }

  // calculate numParticipants and ceremonyProgress, and put them in return json
  const numParticipants = ceremonyPartial.participants.length;
  let completedParticipants = 0;
  for (const participant of ceremonyPartial.participants) {
    completedParticipants += participant.state === "COMPLETE" ? 1 : 0;
  }
  let ceremonyProgress = Math.min(
    99,
    (100 * completedParticipants) / numParticipants
  );
  if (ceremonyPartial.ceremonyState === "COMPLETE") {
    ceremonyProgress = 100;
  }
  ceremonyPartial.numParticipants = numParticipants;
  ceremonyPartial.ceremonyProgress = ceremonyProgress;

  // cast string -> moment
  for (let castToMoment of ["startTime", "endTime", "completedAt"]) {
    if (ceremonyPartial[castToMoment] !== undefined) {
      ceremonyPartial[castToMoment] = moment(ceremonyPartial[castToMoment]);
    }
  }

  return ceremonyPartial;
}

module.exports = { getMPCCeremony, getMPCSummary };
