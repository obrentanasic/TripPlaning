import type { AxiosInstance } from 'axios';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../dto/auth.dto';

export interface IAuthService {
  login(payload: LoginRequest): Promise<AuthResponse>;
  register(payload: RegisterRequest): Promise<AuthResponse>;
}

interface ApiError {
  error?: string;
  title?: string;
  errors?: Record<string, string[]>;
}

function extractError(payload: ApiError | undefined, fallback: string): string {
  if (!payload) return fallback;
  if (payload.error) return payload.error;
  if (payload.errors) {
    const first = Object.values(payload.errors)[0];
    if (first?.length) return first[0];
  }
  return payload.title ?? fallback;
}

export class HttpAuthService implements IAuthService {
  constructor(private readonly http: AxiosInstance) {}

  async login(payload: LoginRequest): Promise<AuthResponse> {
    try {
      const { data } = await this.http.post<AuthResponse>('/auth/login', payload);
      return data;
    } catch (err) {
      throw new Error(this.toMessage(err, 'Pogrešan email ili lozinka.'));
    }
  }

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    try {
      const { data } = await this.http.post<AuthResponse>('/auth/register', payload);
      return data;
    } catch (err) {
      throw new Error(this.toMessage(err, 'Greška pri registraciji.'));
    }
  }

  private toMessage(err: unknown, fallback: string): string {
    if (typeof err === 'object' && err !== null && 'response' in err) {
      const response = (err as { response?: { data?: ApiError } }).response;
      return extractError(response?.data, fallback);
    }
    return fallback;
  }
}
