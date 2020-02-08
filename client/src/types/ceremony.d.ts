export interface Ceremony {
  id: string;
  description: string;
  ip: string;
  github?: string;
  homepage?: string;
  // copied from setup-mpc-common
  name: string;
  ceremonyState: string;
  paused: boolean;
  maxTier2: number;
  minParticipants: number;
  startTime: string;
  endTime: string;
  latestBlock: number;
  selectBlock: number;
  completedAt?: string;
  participants: Participant[];
}

export interface Participant {
  // Server controlled data.
  sequence: number;
  address: string;
  state: string;
  // Position in the queue (can vary due to online/offline changes), or position computation took place (fixed).
  position: number;
  // Priority is randomised at the selection date, after which it is fixed. It's used to determine position.
  priority: number;
  tier: number;
  verifyProgress: number;
  lastVerified?: string;
  addedAt: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  online: boolean;
  lastUpdate?: string;
  location?: ParticipantLocation;
  invalidateAfter?: number;

  // Client controlled data.
  runningState: string;
  transcripts: Transcript[]; // Except 'complete' participants
  computeProgress: number;
  fast: boolean;
}

export interface Transcript {
  // Server controlled data.
  state: string;
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

export interface CeremonySummary {
  id: string;
  name: string;
  description: string;
  start: string;
  end: string;
  ip: string;
  github?: string;
  homepage?: string;
}
