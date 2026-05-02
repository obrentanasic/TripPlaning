import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../models/User';
import { setAuthToken } from '../services/http';
import { useService } from '../hooks/useService';
import type { LoginRequest, RegisterRequest } from '../dto/auth.dto';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (payload: LoginRequest) => Promise<User>;
  register: (payload: RegisterRequest) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const authService = useService('auth');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const apply = (t: string, u: User) => {
    setAuthToken(t);
    setToken(t);
    setUser(u);
  };

  const login = useCallback(
    async (payload: LoginRequest) => {
      setLoading(true);
      try {
        const res = await authService.login(payload);
        apply(res.token, res.user);
        return res.user;
      } finally {
        setLoading(false);
      }
    },
    [authService]
  );

  const register = useCallback(
    async (payload: RegisterRequest) => {
      setLoading(true);
      try {
        const res = await authService.register(payload);
        apply(res.token, res.user);
        return res.user;
      } finally {
        setLoading(false);
      }
    },
    [authService]
  );

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
