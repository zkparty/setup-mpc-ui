const axios = require("axios").default;
const moment = require("moment");
const { shallowPick } = require("./utils");

async function getMPCSummary(url) {
  // gets an mpcState object from an mpc server and transforms it into a partial Ceremony object (containing all non-firebase fields)
  // throws if request fails, or if response does not conform to expectation
  const config = {
    timeout: 2000
  };
  const response = await axios.get(url + "/api/state-summary", config);
  return stateSummaryJsonToCeremonyPartial(response.data);
}

async function getMPCCeremony(url, sequence) {
  // gets an mpcState object from an mpc server and transforms it into a partial Ceremony object (containing all non-firebase fields)
  // throws if request fails, or if response does not conform to expectation
  const config = {
    timeout: 5000
  };
  if (sequence) {
    config.params = { sequence };
  }
  const response = await axios.get(url + "/api/state", config);
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
    "numParticipants",
    "ceremonyProgress"
  ];
  const optionalCeremonyFields = ["completedAt"];
  const ceremonyPartial = shallowPick(
    json,
    requiredCeremonyFields,
    optionalCeremonyFields
  );

  // cast string -> date
  for (let castToDate of ["startTime", "endTime", "completedAt"]) {
    if (ceremonyPartial[castToDate] !== undefined) {
      ceremonyPartial[castToDate] = moment(
        ceremonyPartial[castToDate]
      ).toDate();
    }
  }

  return ceremonyPartial;
}

function stateJsonToCeremonyPartial(json) {
  // returns a json with all fields that are not firebase-only
  // DOES include full participants data
  // throws if json is missing required fields

  // validate ceremony fields
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

  // validate participant fields
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

    // cast string -> date for participant fields
    for (let castToDate of [
      "lastVerified",
      "addedAt",
      "startedAt",
      "completedAt",
      "lastUpdate"
    ]) {
      if (participant[castToDate] !== undefined) {
        participant[castToDate] = moment(participant[castToDate]).toDate();
      }
    }

    // validate transcript fields
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
    (100 * completedParticipants) / ceremonyPartial.minParticipants
  );
  if (ceremonyPartial.ceremonyState === "COMPLETE") {
    ceremonyProgress = 100;
  }
  ceremonyPartial.numParticipants = numParticipants;
  ceremonyPartial.ceremonyProgress = ceremonyProgress;

  // cast string -> date
  for (let castToDate of ["startTime", "endTime", "completedAt"]) {
    if (ceremonyPartial[castToDate] !== undefined) {
      ceremonyPartial[castToDate] = moment(
        ceremonyPartial[castToDate]
      ).toDate();
    }
  }

  return ceremonyPartial;
}

module.exports = { getMPCCeremony, getMPCSummary };
