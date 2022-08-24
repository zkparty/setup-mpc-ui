export type queueState =
  | "WAITING"
  | "RUNNING"
  | "COMPLETED"
  | "ABSENT"
  | "UNKNOWN"
  | "LEFT"
  | "FAILEDTOCHECK";

export interface Queue {
    index: number;
    uid: string;
    status: queueState;
    expectedTimeToStart: Date;
    checkingDeadline: Date;
}