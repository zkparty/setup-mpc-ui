import { Request } from 'express';
import { EmailIdentifier } from 'firebase-admin/lib/auth/identifier';

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

export interface GithubUserProfile {
  username: string;
  _json: {
    created_at: string;
  }
}