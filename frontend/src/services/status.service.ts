import axios from 'axios';

export interface ServiceProbe {
  name: string;
  url: string;
  type: 'stateless' | 'stateful';
  status: 'unknown' | 'ok' | 'down';
  latencyMs?: number;
  payload?: unknown;
}

export interface IStatusService {
  targets(): ServiceProbe[];
  probeAll(): Promise<ServiceProbe[]>;
}

const apiBase =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:8080/api';

const gatewayHealth = apiBase.replace(/\/api\/?$/, '/health');

const usersHealth =
  (import.meta.env.VITE_USERS_HEALTH_URL as string | undefined) ??
  'http://localhost:8081/health';
const tripsHealth =
  (import.meta.env.VITE_TRIPS_HEALTH_URL as string | undefined) ??
  'http://localhost:8082/health';
const shareHealth =
  (import.meta.env.VITE_SHARE_HEALTH_URL as string | undefined) ??
  'http://localhost:8083/health';

export class HttpStatusService implements IStatusService {
  targets(): ServiceProbe[] {
    return [
      { name: 'Gateway',      url: gatewayHealth, type: 'stateless', status: 'unknown' },
      { name: 'UsersService', url: usersHealth,   type: 'stateless', status: 'unknown' },
      { name: 'TripsService', url: tripsHealth,   type: 'stateless', status: 'unknown' },
      { name: 'ShareService', url: shareHealth,   type: 'stateful',  status: 'unknown' },
    ];
  }

  async probeAll(): Promise<ServiceProbe[]> {
    return Promise.all(this.targets().map((t) => this.probe(t)));
  }

  private async probe(p: ServiceProbe): Promise<ServiceProbe> {
    const start = performance.now();
    try {
      const { data } = await axios.get(p.url, { timeout: 5000 });
      return {
        ...p,
        status: 'ok',
        latencyMs: Math.round(performance.now() - start),
        payload: data,
      };
    } catch {
      return { ...p, status: 'down', latencyMs: Math.round(performance.now() - start) };
    }
  }
}
