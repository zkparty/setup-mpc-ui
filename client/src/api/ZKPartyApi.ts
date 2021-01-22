import { Ceremony, Contribution } from "../types/ceremony";
import { addCeremony as addCeremonyToDB } from "./FirestoreApi";
import firebase from 'firebase/app';

require('dotenv').config();
const url = process.env.API_URL ? process.env.API_URL : "http://localhost:80";

export function getCeremonySummariesCached(): Promise<Ceremony[]> {
  // throws if fetch error
  return fetch(`${url}/api/ceremonies-cached`)
    .then(response => {
      return response.json();
    })
    .then(json => {
      return json.map(jsonToCeremony);
    })
    .catch(err => {
      console.error("Error occurred fetching ceremonies:");
      console.error(err);
      throw err;
    });
}

export function getCeremonySummaries(): Promise<Ceremony[]> {
  // throws if fetch error
  return fetch(`${url}/api/ceremonies`)
    .then(response => {
      return response.json();
    })
    .then(json => {
      return json.map(jsonToCeremony);
    })
    .catch(err => {
      console.error("Error occurred fetching ceremonies:");
      console.error(err);
      throw err;
    });
}

export function getCeremonyDataCached(id: string): Promise<Ceremony | null> {
  // throws if fetch error
  return fetch(`${url}/api/ceremony-cached/${id}`)
    .then(response => {
      if (response.status === 404) {
        return null;
      }
      return response.json();
    })
    .then(json => {
      if (!json) {
        return null;
      }
      return jsonToCeremony(json);
    })
    .catch(err => {
      console.error("Error occurred fetching ceremony:");
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
    .then(json => {
      if (!json) {
        return null;
      }
      return jsonToCeremony(json);
    })
    .catch(err => {
      console.error("Error occurred fetching ceremony:");
      console.error(err);
      throw err;
    });
};

export function addCeremony(ceremony: Ceremony): Promise<string> {
  return addCeremonyToDB(ceremony);
  // throws if fetch error
  // return fetch(`${url}/api/add-ceremony`, {
  //   method: "post",
  //   body: JSON.stringify(ceremony),
  //   headers: { "Content-Type": "application/json" }
  // })
  //   .then(response => {
  //     return response.json();
  //   })
  //   .then(json => {
  //     return json.id;
  //   })
  //   .catch(err => {
  //     console.error("Error occurred posting ceremony:");
  //     console.error(err);
  //     throw err;
  //   });
};

const tryDate = (d: firebase.firestore.Timestamp | undefined, defaultResult?: Date): Date | undefined => {
  if (!d) return defaultResult;
  try {
    return d.toDate();
  } catch (e) {
    console.warn(`error converting firebase date ${e.message}`);
    return defaultResult;
  }
}

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

export const jsonToContribution = (json: any): Contribution => {
  return {
    ...json
  }
}

// Create a gist to record a contribution
export const createGist = async (ceremonyId: string, ceremonyTitle: string, index: number, hash: string, authToken: string): Promise<string> => {
  const summary = {
    ceremony: ceremonyTitle,
    ceremonyId: ceremonyId,
    time: new Date(),
    contributionNumber: index,
    hash: hash,
  }
  const gist = {
    description: "zkparty phase2 tusted setup MPC contribution summary",
    public: true,
    files: {
        "contribution.txt": {content: JSON.stringify(summary, undefined, 2)},
  }};
  const res = await fetch('https://api.github.com/gists', {
    method: 'post',
    body: JSON.stringify(gist),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `bearer ${authToken}`,
    }

  })
  .catch(err => console.warn(`Error creating gist. ${err.message}`));
  // TODO handle result, get gist url and return it.
  console.debug(`${res ? 'ok' : 'error'}`);
  if (res) return (await res.json()).html_url;
  return '';
}