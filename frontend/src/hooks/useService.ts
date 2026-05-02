import { services, type Services } from '../services';

export function useService<K extends keyof Services>(name: K): Services[K] {
  return services[name];
}
