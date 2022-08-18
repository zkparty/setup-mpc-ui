export interface LoginRequest {
    address: string;
    signature: string;
}
export interface LoginResponse {
    code: number;
    token?: string;
    message?: string;
}

export type queueState =
  | "WAITING"
  | "RUNNING"
  | "COMPLETED"
  | "ABSENT"
  | "UNKNOWN";
export interface queueStatus {
    status: queueState;
    expectedTimeToStart: Date;
    checkingDeadline: Date;
}