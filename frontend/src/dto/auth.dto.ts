import type { User } from '../models/User';

export interface LoginRequest {
  email: string;
  lozinka: string;
}

export interface RegisterRequest {
  ime: string;
  email: string;
  lozinka: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
