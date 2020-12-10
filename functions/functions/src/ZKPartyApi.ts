import { Ceremony, Contribution } from "./types/ceremony";


export function jsonToCeremony(json: any): Ceremony {
  // throws if ceremony is malformed

  const {
    lastParticipantsUpdate,
    lastSummaryUpdate,
    startTime,
    endTime,
    completedAt,
    participants,
    ...rest
  } = json;

  //const start: firebase.firestore.Timestamp = startTime;
  //console.log(`start time ${start ? start.toDate().toLocaleDateString() : '-'}`);

  return {
    ...rest,
    lastParticipantsUpdate: lastParticipantsUpdate ? lastParticipantsUpdate.toDate() : undefined,
    lastSummaryUpdate: lastSummaryUpdate ? lastSummaryUpdate.toDate(): undefined,
    startTime: startTime ? startTime.toDate() : new Date(),
    endTime: endTime ? endTime.toDate() : undefined,
  };
}

export const jsonToContribution = (json: any): Contribution => {
  return {
    ...json
  }
}
