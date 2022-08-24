export type participantRole =
  | "PARTICIPANT"
  | "COORDINATOR";

export interface Participant {
    uid: string;
    displayName: string;
    role: participantRole;
    addedAt: Date;
    lastUpdate: Date;
}