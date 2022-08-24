import { Timestamp } from "firebase-admin/firestore";

export type ComputeMode =
  | "ZKEY"
  | "POWERSOFTAU";

export type CeremonyState =
  | "WAITING"
  | "RUNNING"
  | "COMPLETED"
  | "PAUSED"
  | "UNKNOWN";

export interface Ceremony {
    // user should input this
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
    startTime: Timestamp;
    endTime: Timestamp;
    minParticipants: number;
    // server would compute this
    ceremonyState: CeremonyState;
    lastSummaryUpdate: Timestamp;
    numParticipants: number;
    complete: number;
    waiting: number;
    currentIndex: number;
    lastValidIndex: number;
    highestQueueIndex: number;
    averageSecondsPerContribution: number;
    sequence?: number;
    zkeyPrefix?: string;
    completedAt?: Timestamp;
    numConstraints?: number;
    transcript?: string;
    hash?: string; // Participant's own hash
    isCompleted?: boolean; // Participant has completed this circuit
}