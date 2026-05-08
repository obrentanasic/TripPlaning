import type { AxiosInstance } from 'axios';
import type { User } from '../models/User';
import type { AdminTripDto } from '../dto/admin.dto';

export interface IAdminService {
  listUsers(): Promise<User[]>;
  setUserStatus(id: string, status: 'aktivan' | 'suspendovan'): Promise<User>;
  deleteUser(id: string): Promise<void>;
  listAllTrips(): Promise<AdminTripDto[]>;
}

interface ApiError {
  error?: string;
}

function extractError(payload: ApiError | undefined, fallback: string): string {
  return payload?.error ?? fallback;
}

export class HttpAdminService implements IAdminService {
  constructor(private readonly http: AxiosInstance) {}

  async listUsers(): Promise<User[]> {
    try {
      const { data } = await this.http.get<User[]>('/users');
      return data;
    } catch (err) {
      throw new Error(this.toMessage(err, 'Greška pri učitavanju korisnika.'));
    }
  }

  async setUserStatus(id: string, status: 'aktivan' | 'suspendovan'): Promise<User> {
    try {
      const { data } = await this.http.patch<User>(`/users/${id}/status`, { status });
      return data;
    } catch (err) {
      throw new Error(this.toMessage(err, 'Greška pri promeni statusa.'));
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await this.http.delete(`/users/${id}`);
    } catch (err) {
      throw new Error(this.toMessage(err, 'Greška pri brisanju korisnika.'));
    }
  }

  async listAllTrips(): Promise<AdminTripDto[]> {
    try {
      const { data } = await this.http.get<AdminTripDto[]>('/admin/trips');
      return data;
    } catch (err) {
      throw new Error(this.toMessage(err, 'Greška pri učitavanju planova.'));
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
