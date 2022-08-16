export interface LoginRequest {
    address: string;
    signature: string;
}
export interface LoginResponse {
    code: number;
    token?: string;
    message?: string;
}