import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { services as defaultServices, type Services } from '../services';

const ServicesContext = createContext<Services>(defaultServices);

export function ServicesProvider({
  value,
  children,
}: {
  value: Services;
  children: ReactNode;
}) {
  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}

export function useService<K extends keyof Services>(name: K): Services[K] {
  return useContext(ServicesContext)[name];
}
