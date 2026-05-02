export type Uloga = 'korisnik' | 'admin';

export type Status = 'aktivan' | 'suspendovan';

export interface User {
  id: string;
  ime: string;
  email: string;
  uloga: Uloga;
  status: Status;
  registrovanDana?: string;
}
