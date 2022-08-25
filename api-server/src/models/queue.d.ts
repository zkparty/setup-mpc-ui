import { Timestamp } from "firebase-admin/firestore";

export type queueState =
  | "WAITING"
  | "READY"
  | "RUNNING"
  | "COMPLETED"
  | "ABSENT"
  | "LEFT"
  | "UNKNOWN";

export interface Queue {
    index: number;
    uid: string;
    status: queueState;
    expectedTimeToStart: Timestamp;
    checkingDeadline: Timestamp;
    computingDeadline?: Timestamp;
  }