import type { AxiosInstance } from 'axios';
import type { CreateTripRequest } from '../dto/trip.dto';
import type {
  Aktivnost,
  ChecklistItem,
  Destinacija,
  Trip,
  Trosak,
} from '../models/Trip';
import type { ITripsService } from './trips.service';

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

export class HttpTripsService implements ITripsService {
  constructor(private readonly http: AxiosInstance) {}

  // ─────────── trips ───────────
  list = () => this.req<Trip[]>('get', '/trips', undefined, 'Greška pri učitavanju planova.');
  get = (id: string) => this.req<Trip>('get', `/trips/${id}`, undefined, 'Plan nije pronađen.');
  create = (payload: CreateTripRequest) =>
    this.req<Trip>('post', '/trips', payload, 'Greška pri kreiranju plana.');
  remove = (id: string) =>
    this.req<void>('delete', `/trips/${id}`, undefined, 'Greška pri brisanju plana.');

  update = (trip: Trip) =>
    this.req<Trip>(
      'put',
      `/trips/${trip.id}`,
      {
        naziv: trip.naziv,
        opis: trip.opis,
        pocetak: trip.pocetak,
        kraj: trip.kraj,
        budzet: trip.budzet,
        valuta: trip.valuta,
        kover: trip.kover,
        boja: trip.boja,
        napomene: trip.napomene,
      },
      'Greška pri čuvanju plana.'
    );

  // ─────────── destinations ───────────
  addDestination = (tripId: string, d: Omit<Destinacija, 'id'>) =>
    this.req<Destinacija>('post', `/trips/${tripId}/destinations`, d, 'Greška pri dodavanju destinacije.');

  updateDestination = (tripId: string, d: Destinacija) =>
    this.req<Destinacija>('put', `/trips/${tripId}/destinations/${d.id}`, {
      naziv: d.naziv,
      lokacija: d.lokacija,
      dolazak: d.dolazak,
      odlazak: d.odlazak,
      opis: d.opis,
      foto: d.foto,
    }, 'Greška pri izmjeni destinacije.');

  removeDestination = (tripId: string, destId: string) =>
    this.req<void>('delete', `/trips/${tripId}/destinations/${destId}`, undefined, 'Greška pri brisanju destinacije.');

  // ─────────── activities ───────────
  addActivity = (tripId: string, a: Omit<Aktivnost, 'id'>) =>
    this.req<Aktivnost>('post', `/trips/${tripId}/activities`, this.activityBody(a), 'Greška pri dodavanju aktivnosti.');

  updateActivity = (tripId: string, a: Aktivnost) =>
    this.req<Aktivnost>('put', `/trips/${tripId}/activities/${a.id}`, this.activityBody(a), 'Greška pri izmjeni aktivnosti.');

  removeActivity = (tripId: string, id: string) =>
    this.req<void>('delete', `/trips/${tripId}/activities/${id}`, undefined, 'Greška pri brisanju aktivnosti.');

  // ─────────── expenses ───────────
  addExpense = (tripId: string, e: Omit<Trosak, 'id'>) =>
    this.req<Trosak>('post', `/trips/${tripId}/expenses`, e, 'Greška pri dodavanju troška.');

  updateExpense = (tripId: string, e: Trosak) =>
    this.req<Trosak>('put', `/trips/${tripId}/expenses/${e.id}`, {
      naziv: e.naziv,
      kategorija: e.kategorija,
      iznos: e.iznos,
      datum: e.datum,
      opis: e.opis,
    }, 'Greška pri izmjeni troška.');

  removeExpense = (tripId: string, id: string) =>
    this.req<void>('delete', `/trips/${tripId}/expenses/${id}`, undefined, 'Greška pri brisanju troška.');

  // ─────────── checklist ───────────
  addChecklistItem = (tripId: string, c: Omit<ChecklistItem, 'id'>) =>
    this.req<ChecklistItem>('post', `/trips/${tripId}/checklist`, c, 'Greška pri dodavanju stavke.');

  updateChecklistItem = (tripId: string, c: ChecklistItem) =>
    this.req<ChecklistItem>('put', `/trips/${tripId}/checklist/${c.id}`, {
      naziv: c.naziv,
      kategorija: c.kategorija,
      zavrseno: c.zavrseno,
    }, 'Greška pri izmjeni stavke.');

  toggleChecklistItem = (tripId: string, id: string, zavrseno: boolean) =>
    this.req<ChecklistItem>('patch', `/trips/${tripId}/checklist/${id}`, { zavrseno }, 'Greška.');

  removeChecklistItem = (tripId: string, id: string) =>
    this.req<void>('delete', `/trips/${tripId}/checklist/${id}`, undefined, 'Greška pri brisanju stavke.');

  // ─────────── helpers ───────────
  private activityBody(a: Omit<Aktivnost, 'id'> | Aktivnost) {
    return {
      destId: a.destId ?? null,
      naziv: a.naziv,
      datum: a.datum,
      vreme: a.vreme,
      lokacija: a.lokacija,
      opis: a.opis,
      trosak: a.trosak,
      status: a.status,
    };
  }

  private async req<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    body: unknown,
    fallback: string
  ): Promise<T> {
    try {
      const res =
        method === 'get'
          ? await this.http.get<T>(url)
          : method === 'delete'
            ? await this.http.delete<T>(url)
            : method === 'post'
              ? await this.http.post<T>(url, body)
              : method === 'put'
                ? await this.http.put<T>(url, body)
                : await this.http.patch<T>(url, body);
      return res.data;
    } catch (err) {
      throw new Error(this.toMessage(err, fallback));
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
