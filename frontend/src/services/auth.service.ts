import type { AuthResponse, LoginRequest, RegisterRequest } from '../dto/auth.dto';
import type { User } from '../models/User';

export interface IAuthService {
  login(payload: LoginRequest): Promise<AuthResponse>;
  register(payload: RegisterRequest): Promise<AuthResponse>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const mockUsers: Record<string, User> = {
  'lana@email.com': {
    id: 'u1',
    ime: 'Lana Marković',
    email: 'lana@email.com',
    uloga: 'admin',
    status: 'aktivan',
    registrovanDana: '2025-11-12',
  },
  'marko@email.com': {
    id: 'u2',
    ime: 'Marko Petrović',
    email: 'marko@email.com',
    uloga: 'korisnik',
    status: 'aktivan',
    registrovanDana: '2026-01-04',
  },
};

export class MockAuthService implements IAuthService {
  async login({ email, lozinka }: LoginRequest): Promise<AuthResponse> {
    await sleep(500);
    const known = mockUsers[email.toLowerCase()];
    if (!known) {
      throw new Error('Nepoznat nalog. Probajte demo račune ispod forme.');
    }
    if (lozinka.length < 6) {
      throw new Error('Lozinka mora imati najmanje 6 karaktera.');
    }
    return { token: `mock.${known.id}.${Date.now()}`, user: known };
  }

  async register({ ime, email, lozinka }: RegisterRequest): Promise<AuthResponse> {
    await sleep(500);
    if (lozinka.length < 6) {
      throw new Error('Lozinka mora imati najmanje 6 karaktera.');
    }
    const isAdmin = email.toLowerCase().startsWith('lana');
    const newUser: User = {
      id: `u${Date.now()}`,
      ime,
      email,
      uloga: isAdmin ? 'admin' : 'korisnik',
      status: 'aktivan',
      registrovanDana: new Date().toISOString().slice(0, 10),
    };
    return { token: `mock.${newUser.id}.${Date.now()}`, user: newUser };
  }
}
