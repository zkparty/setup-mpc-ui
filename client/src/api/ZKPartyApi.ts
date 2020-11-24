import { Ceremony } from "../types/ceremony";

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
  // throws if fetch error
  return fetch(`${url}/api/add-ceremony`, {
    method: "post",
    body: JSON.stringify(ceremony),
    headers: { "Content-Type": "application/json" }
  })
    .then(response => {
      return response.json();
    })
    .then(json => {
      return json.id;
    })
    .catch(err => {
      console.error("Error occurred posting ceremony:");
      console.error(err);
      throw err;
    });
};

export function getUserPrivs(userId: string): Promise<string> {
  // throws if fetch error
  return fetch(`${url}/api/get-user-status`, {
    method: "post",
    body: JSON.stringify({ userid: userId }),
    headers: { "Content-Type": "application/json" }
  })
    .then(response => {
      return response.text();
    })
    .catch(err => {
      console.error("Error occurred getting privs");
      console.error(err);
      throw err;
    });
};

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

  return {
    ...rest,
    lastParticipantsUpdate: new Date(Date.parse(lastParticipantsUpdate)),
    lastSummaryUpdate: new Date(Date.parse(lastSummaryUpdate)),
    startTime: new Date(Date.parse(startTime)),
    endTime: new Date(Date.parse(endTime)),
    completedAt: completedAt ? new Date(Date.parse(completedAt)) : undefined,
    participants: participants
      ? participants.map(
          ({
            addedAt,
            startedAt,
            completedAt,
            lastVerified,
            lastUpdate,
            ...rest
          }: any) => ({
            ...rest,
            addedAt: new Date(Date.parse(addedAt)),
            startedAt: startedAt ? new Date(Date.parse(startedAt)) : undefined,
            completedAt: completedAt
              ? new Date(Date.parse(completedAt))
              : undefined,
            lastUpdate: lastUpdate
              ? new Date(Date.parse(lastUpdate))
              : undefined,
            lastVerified: lastVerified
              ? new Date(Date.parse(lastVerified))
              : undefined
          })
        )
      : undefined
  };
}
