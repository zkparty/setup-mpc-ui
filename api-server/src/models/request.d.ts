import { Request } from 'express';

export interface LoginRequest {
    address: string;
    signature: string;
}

export interface LoginResponse {
    code: number;
    token?: string;
    message?: string;
}

export interface AuthenticatedRequest extends Request {
  user: User;
}