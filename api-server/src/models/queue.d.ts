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
    expectedTimeToStart: Date;
    checkingDeadline: Date;
}