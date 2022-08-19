export type userRole =
  | "PARTICIPANT"
  | "COORDINATOR";

export type queueState =
  | "WAITING"
  | "RUNNING"
  | "COMPLETED"
  | "ABSENT"
  | "UNKNOWN"
  | "LEFT"
  | "FAILEDTOCHECK";

export interface Participant {
    uid: string;
    displayName: string;
    role: userRole;
    addedAt: Date;
    lastUpdate: Date;
    status: queueState;
    index: number;
    expectedTimeToStart: Date;
    checkingDeadline: Date;
}