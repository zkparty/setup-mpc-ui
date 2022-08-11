import { LoginRequest } from "../models/participant"
export function loginParticipant(loginRequest: LoginRequest): string {
    // TODO: no Firebase authentication involved. Just check ECRecover and send back the token
    return "Hello";
}