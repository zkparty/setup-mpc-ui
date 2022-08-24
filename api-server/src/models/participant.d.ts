import { Timestamp } from "firebase-admin/firestore";

export type participantRole =
  | "PARTICIPANT"
  | "COORDINATOR";

export interface Participant {
    uid: string;
    displayName: string;
    role: participantRole;
    addedAt: Timestamp;
}