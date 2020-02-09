import { CeremonySummary, Ceremony } from "../types/ceremony";
import moment from "moment";

const url = process.env.API_URL ? process.env.API_URL : "http://localhost:80";

export function getCeremonySummaries(): Promise<CeremonySummary[]> {
  // throws if fetch error
  return fetch(`${url}/api/ceremonies`)
    .then(response => {
      return response.json(); // should be CeremonySummary[]
    })
    .catch(err => {
      console.error("Error occurred fetching ceremonies:");
      console.error(err);
      throw err;
    });
}

export function getCeremonyData(id: string): Promise<Ceremony | null> {
  // throws if fetch error
  return fetch(`${url}/api/ceremony/${id}`)
    .then(response => {
      if (response.status === 404) {
        return null;
      }
      return response.json();
    })
    .catch(err => {
      console.error("Error occurred fetching ceremony:");
      console.error(err);
      throw err;
    });
}

function jsonToCeremony(json: any): Ceremony {
  // throws if ceremony is malformed

  const {
    lastFullUpdate,
    lastSummaryUpdate,
    startTime,
    endTime,
    completedAt,
    participants,
    messages,
    ...rest
  } = json;

  return {
    ...rest,
    lastFullUpdate: moment(lastFullUpdate),
    lastSummaryUpdate: moment(lastSummaryUpdate),
    startTime: moment(startTime),
    endTime: moment(endTime),
    completedAt: completedAt ? moment(completedAt) : undefined,
    messages: messages || [],
    participants: participants.map(
      ({ startedAt, lastUpdate, completedAt, addedAt, ...rest }: any) => ({
        ...rest,
        addedAt: moment(addedAt),
        startedAt: startedAt ? moment(startedAt) : undefined,
        lastUpdate: lastUpdate ? moment(lastUpdate) : undefined,
        completedAt: completedAt ? moment(completedAt) : undefined
      })
    )
  };
}
