import { Ceremony, CeremonyEvent, CeremonyState, 
  Contribution, ContributionState, ContributionSummary, 
  Participant, Queue as QueueType, Project } from '../types/ceremony';
// import firebase from 'firebase/app';
// import firestore from "firebase/firestore";
import { jsonToCeremony, jsonToContribution } from './ZKPartyApi';
import Queue from './Ceremony';

const COMPLETE = "COMPLETE";
const INVALIDATED = "INVALIDATED";
const RUNNING = "RUNNING";
const WAITING = "WAITING";
const PRESELECTION = "PRESELECTION";
const VERIFIED = "VERIFIED";
const VERIFY_FAILED = "VERIFY_FAILED";
const ABORTED = "ABORTED";

enum ComputeMode { 
  ZKEY,
  POWERSOFTAU,
};

//=====================================================================================

export async function addCeremony(circuit: Ceremony): Promise<string> {
    // const db = firebase.firestore();
    // try {
    //   const doc = await db.collection("ceremonies")
    //     .withConverter(ceremonyConverter)
    //     .add(circuit);
  
    //   console.log(`new circuit added with id ${doc.id}`);
       return "";
    // } catch (e) {
    //   throw new Error(`error adding circuit data to firebase: ${e}`);
    //}
};

export async function updateCeremony(circuit: Ceremony): Promise<void> {
};

export async function getCeremony(id: string): Promise<Ceremony | undefined> {
  return (Queue as unknown as QueueType).ceremonyState;
}

// Return all circuits for a project
export const getCeremonies = async (project: string): Promise<Ceremony[]> => {
  const cs = (Queue as unknown as QueueType).ceremonyState?.circuitStats;

  
  const ccts: Ceremony[] = cs;
  return ccts;
}

// Counts the waiting and complete contributions for a circuit
export const getCeremonyCount = async (name: string): Promise<any> => {
  const cs = (Queue as unknown as QueueType).ceremonyState?.circuitStats;
  const cct = cs[name];

  return {complete: cct.contributionsCount, waiting: 0, transcript: '/contribution/' + cct.name + '/latest'};
}

export async function getCeremonyContributions(id: string): Promise<ContributionSummary[]> {
  // Return all contributions, in reverse time order
  return [];
}

export const addCeremonyEvent = async (ceremonyId: string, event: CeremonyEvent) => {
};

export const ceremonyEventListener = async (ceremonyId: string | undefined, callback: (e: any) => void): Promise<()=>void> => {
    return () => {}  
};

/* Listens for events on all circuits */
export const circuitEventListener = async (callback: (e: any) => void): Promise<()=>void> => {
  return () => {};
};

// Listens for updates to circuit data. Running circuits only.
export const ceremonyListener = async (project: string, callback: (c: Ceremony) => void) => {
};

// Listens for updates to a circuit
export const ceremonyUpdateListener = async (id: string, callback: (c: Ceremony) => void): Promise<()=>void> => {
  return () => {};
};

// Listens for updates to ceremony contributions
export const contributionUpdateListener = async (
    id: string, 
    callback: (c: ContributionSummary,
      type: string,
      oldIndex?: number
      ) => void,
    ): Promise<()=>void> => {
      return () => {};
};


// Listens for updates to eligible ceremonies that a participant may contribute to.
// The first such ceremony found will be returned in the callback
// TODO - Maybe obsolete. Can be removed
export const ceremonyContributionListener = (participantId: string, isCoordinator: boolean, callback: (c: ContributionState | boolean) => void): () => void => {
  return () => {};
};

// Join this circuit. 
export const joinCircuit = async (ceremonyId: string, participantId: string): Promise<ContributionState | undefined> => {

  await (Queue as unknown as QueueType).join(participantId);
  return undefined;
};

export const getNextQueueIndex = async (ceremonyId: string): Promise<number> => {
  const cs = (Queue as unknown as QueueType).ceremonyState;
  return cs.queueLength;
};

export const getContributionState = async (ceremony: Ceremony, contribution: Contribution): Promise<ContributionState> => {
  const state = (Queue as unknown as QueueType).ceremonyState;

  let contState = {
    ceremony,
    participantId: contribution.participantId,
    queueIndex: contribution.queueIndex ? contribution.queueIndex : 1,
  };
  // Get currently running contributor's index
  // Get average time per contribution & expected wait time
  const stats = await getCeremonyStats(ceremony.id);

  // expected start time = now + (queueIndex - currentIndex) x av secs per contrib
  const estStartTime = Date.now() + 1000 * ((contState.queueIndex - stats.currentIndex) * stats.averageSecondsPerContribution);
  const cs: ContributionState = {
    ...contState,
    status: WAITING,
    currentIndex: stats.currentIndex,
    lastValidIndex: stats.lastValidIndex,
    averageSecondsPerContribution: stats.averageSecondsPerContribution,
    expectedStartTime: estStartTime,
  }

  return cs;
};

const getCeremonyStats = async (ceremonyId: string): Promise<any> => {
  let contributionStats = {
    currentIndex: 0,
    averageSecondsPerContribution: 0,
    lastValidIndex: 0,
    complete: 0,
    waiting: 0,
    transcript: '',
  };
  // For average time calcs
  let totalSecs = 0;
  let numContribs = 0;
  let durationContribs = 0;


  contributionStats.averageSecondsPerContribution = 
        Math.floor(totalSecs / durationContribs);

  contributionStats.complete = numContribs;

  return contributionStats;
};

// Will refer to the unsub function for the latest ceremony queue listener, if any
// A client may import this and use it to unsubscribe
export var ceremonyQueueListenerUnsub: () => void;

// Listens for circuit events, to track progress
export const ceremonyQueueListener = async (ceremonyId: string, callback: (c: any) => void) => {


};

export const updateContribution = async (ceremonyId: string, contribution: Contribution) => {

};

export const insertContribution = async (ceremonyId: string, contribution: Contribution) => {

};


export const addOrUpdateParticipant = async (participant: Participant) => {
};

const  getParticipantContributionsSnapshot = async (project: Project, participant: string): Promise<firebase.firestore.QueryDocumentSnapshot<ContributionSummary>[]> => {
}

export const getParticipantContributions = async (project: Project, participant: string, isCoordinator: boolean = false): Promise<any[]> => {
  const cs = (Queue as unknown as QueueType).ceremonyState?.circuitStats;
  return cs;
}

export const countParticipantContributions = async (project: Project, participant: string): Promise<number> => {
  const cs = (Queue as unknown as QueueType).ceremonyState?.circuitStats;
  return cs.length;
}

export const resetContributions = async (participant: string): Promise<void> => {
}

export const getUserStatus = async (userId: string, project: string): Promise<string> => {
  return "USER";
};

export const getSiteSettings = async (): Promise<firebase.firestore.DocumentData | undefined> => {
  return undefined;
}

export const getProject = async (project: string): Promise<Project | undefined> => {
  return undefined;
}

export const extractContribs = async (): Promise<firebase.firestore.QueryDocumentSnapshot<ContributionSummary>[]> => {
  return [];
}

export const resetContrib = async (circuitId: string, participantId: string, idx: number) => {
}