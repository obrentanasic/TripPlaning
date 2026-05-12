import type { AxiosInstance } from 'axios';

export interface IssueShareResponse {
  token: string;
  url: string;
  accessLevel: 'view' | 'edit';
  expiresAt: string;
}

export interface ResolveShareResponse {
  token: string;
  tripId: string;
  accessLevel: 'view' | 'edit';
  expiresAt: string;
}

export interface IShareService {
  issueShare(tripId: string, accessLevel: 'view' | 'edit'): Promise<IssueShareResponse>;
  resolveShare(token: string): Promise<ResolveShareResponse>;
  revokeAllForTrip(tripId: string): Promise<void>;
}

export class HttpShareService implements IShareService {
  private readonly http: AxiosInstance;

  constructor(http: AxiosInstance) {
    this.http = http;
  }

  async issueShare(tripId: string, accessLevel: 'view' | 'edit') {
    const { data } = await this.http.post<IssueShareResponse>(
      `/trips/${tripId}/share`,
      { accessLevel }
    );
    return data;
  }

  async resolveShare(token: string) {
    const { data } = await this.http.get<ResolveShareResponse>(`/share/${token}`);
    return data;
  }

  async revokeAllForTrip(tripId: string) {
    await this.http.delete(`/trips/${tripId}/share`);
  }
}
