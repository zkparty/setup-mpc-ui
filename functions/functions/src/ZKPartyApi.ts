import { Ceremony } from "./types/ceremony";


export function jsonToCeremony(json: any): Ceremony {
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

  return {
    ...rest,
    lastSummaryUpdate: lastSummaryUpdate ? lastSummaryUpdate.toDate(): undefined,
    startTime: startTime ? startTime.toDate() : new Date(),
    endTime: endTime ? endTime.toDate() : undefined,
  };
}

// export const jsonToContribution = (json: any): Contribution => {
//   return {
//     ...json
//   }
// }
