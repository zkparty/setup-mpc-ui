import { CeremonySummary, Ceremony } from "../types/ceremony";

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
