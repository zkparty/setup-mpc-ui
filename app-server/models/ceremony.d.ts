export type ComputeMode =
  | "ZKEY"
  | "POWERSOFTAU";

export type CeremonyState =
  | "PRESELECTION"
  | "SELECTED"
  | "RUNNING"
  | "COMPLETE"
  | "WAITING"
  | "PAUSED"
  | "UNKNOWN";

export interface Ceremony {
    // firebase-only data
    id: string;
    title: string;
    serverURL: string;
    description: string;
    circuitFileName: string;
    mode: ComputeMode;
    instructions: string;
    github: string;
    homepage: string;
    adminAddr: string;
    lastSummaryUpdate: Date;

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
    complete: number;
    waiting: number;
    numConstraints?: number;
    averageDuration?: number;
    transcript?: string;
    hash?: string; // Participant's own hash
    isCompleted?: boolean; // Participant has completed this circuit
    highestQueueIndex: number;
    zkeyPrefix: string;
}