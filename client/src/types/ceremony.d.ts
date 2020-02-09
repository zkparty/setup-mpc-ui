import { Moment } from "moment";

export type CeremonyState =
  | "PRESELECTION"
  | "SELECTED"
  | "RUNNING"
  | "COMPLETE"
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
  serverURL: string;
  description: string;
  instructions: string;
  github: string;
  homepage: string;
  adminAddr: string;
  lastParticipantsUpdate: Moment;
  lastSummaryUpdate: Moment;

  // fetched from mpc server, cached by zkp server for when / if mpc server is disconnected
  ceremonyState: CeremonyState;
  startTime: Moment;
  endTime: Moment;
  completedAt?: Moment;
  paused: boolean;
  selectBlock: number;
  minParticipants: number;
  maxTier2: number;
  sequence: number;
  ceremonyProgress: number; // this is only returned by /api/state-summary, else must be computed by us
  numParticipants: number; // this is only returned by /api/state-summary, else must be computed by us
  participants?: Participant[]; // we only request this field when needed
}

export interface Participant {
  // Coordinator server controlled data.
  address: string;
  state: ParticipantState; // is participant queued, currently computing, done, or invalidated?
  runningState: ParticipantRunningState; // if the participant is computing, are they computing offline? (or maybe they are queued or invalidated)
  position: number;
  priority: number;
  tier: number;
  verifyProgress: number;
  lastVerified?: Moment;
  addedAt: Moment;
  startedAt?: Moment;
  completedAt?: Moment;
  error?: string;
  online: boolean;
  lastUpdate?: Moment;
  location?: ParticipantLocation;
  invalidateAfter?: number;
  sequence: number;
  transcripts: Transcript[]; // Except 'complete' participants
  computeProgress: number;

  // ZKParty data
  messages: Message[];
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
