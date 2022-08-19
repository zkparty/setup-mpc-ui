export interface LoginRequest {
    address: string;
    signature: string;
}
export interface LoginResponse {
    code: number;
    token?: string;
    message?: string;
}

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
export interface User {
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