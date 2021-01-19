export type CeremonyState =
  | "PRESELECTION"
  | "SELECTED"
  | "RUNNING"
  | "COMPLETE"
  | "WAITING"
  | "PAUSED"
  | "UNKNOWN";

export type ParticipantState =
    | "WAITING"
    | "RUNNING"
    | "COMPLETE"
    | "INVALIDATED";

export type ParticipantRunningState =
  | "OFFLINE"
  | "WAITING"
  | "RUNNING"
  | "COMPLETE";

export type TranscriptState = "WAITING" | "VERIFYING" | "COMPLETE";

export interface Ceremony {
  // firebase-only data
  id: string;
  title: string;
  serverURL: string;
  description: string;
  circuitFileName: string;
  instructions: string;
  github: string;
  homepage: string;
  adminAddr: string;
  lastSummaryUpdate: Date;

  // fetched from mpc server, cached by zkp server for when / if mpc server is disconnected
  ceremonyState: CeremonyState;
  startTime: Date | string;
  endTime: Date | string | undefined;
  completedAt?: Date;
  paused: boolean;
  selectBlock: number;
  minParticipants: number;
  maxTier2: number;
  sequence: number;
  ceremonyProgress: number; // this is only returned by /api/state-summary, else must be computed by us
  numParticipants: number; // this is only returned by /api/state-summary, else must be computed by us
  participants?: Participant[]; // we only request this field when needed
  complete: number;
  waiting: number;
  numConstraints?: number;
}

export interface Participant {
  // Coordinator server controlled data.
  address: string;
  uid: string; // Firebase.auth uid. Also firestore document id.
  state: ParticipantState; // is participant queued, currently computing, done, or invalidated?
  //runningState: ParticipantRunningState; // if the participant is computing, are they computing offline? (or maybe they are queued or invalidated)
  //position: number;
  //priority: number;
  tier: number;
  //verifyProgress: number;
  lastVerified?: Date;
  addedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  online: boolean;
  lastUpdate?: Date;
  //location?: ParticipantLocation;
  //invalidateAfter?: number;
  //sequence: number;
  //transcripts: Transcript[]; // Except 'complete' participants
  computeProgress: number;

  // ZKParty data
  //messages: Message[];
}

export interface CeremonyEvent {
  ceremonyId?: string;
  sender: string;
  eventType: string;
  timestamp: timestamp;
  message: string;
  index?: number;
  acknowledged: boolean;
}

export interface Transcript {
  // Server controlled data.
  state: TranscriptState;
  // Client controlled data.
  num: number;
  fromAddress?: string;
  size: number;
  downloaded: number;
  uploaded: number;
}

export interface ParticipantLocation {
  city?: string;
  country?: string;
  continent?: string;
  latitude?: number;
  longitude?: number;
}

export interface Message {
  content: string;
  timestamp: string;
  signature: string;
}

//declare global {
//  interface Window { wasmPhase2: any; }
//}

export interface Contribution {
  participantId: string;
  queueIndex?: number;
  lastSeen?: timestamp;
  timeAdded?: timestamp;
  status: ParticipantState;
  index?: number;
}

export interface ContributionSummary extends Contribution {
  paramsFile?: string;
  timeCompleted?: timestamp;
  hash?: string;
  duration?: number;
}

export interface ContributionState {
  ceremony: Ceremony;
  queueIndex: number;
  currentIndex: number;
  lastValidIndex: number;
  averageSecondsPerContribution: number;
  expectedStartTime?: timestamp;
  status: ParticipantState;
  startTime?: date;
}
