import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export interface JWTPayload {
  id: string;
  email: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  full_name?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    full_name?: string;
    created_at: Date;
  };
}
