import type { CreateTripRequest } from '../dto/trip.dto';
import type {
  Aktivnost,
  ChecklistItem,
  Destinacija,
  Trip,
  Trosak,
} from '../models/Trip';
import { uid } from '../lib/format';
import { SAMPLE_TRIPS } from '../lib/sampleData';

export interface ITripsService {
  // top-level
  list(): Promise<Trip[]>;
  get(id: string): Promise<Trip>;
  create(payload: CreateTripRequest): Promise<Trip>;
  update(trip: Trip): Promise<Trip>;
  remove(id: string): Promise<void>;

  // destinations
  addDestination(tripId: string, dest: Omit<Destinacija, 'id'>): Promise<Destinacija>;
  updateDestination(tripId: string, dest: Destinacija): Promise<Destinacija>;
  removeDestination(tripId: string, destId: string): Promise<void>;

  // activities
  addActivity(tripId: string, activity: Omit<Aktivnost, 'id'>): Promise<Aktivnost>;
  updateActivity(tripId: string, activity: Aktivnost): Promise<Aktivnost>;
  removeActivity(tripId: string, activityId: string): Promise<void>;

  // expenses
  addExpense(tripId: string, expense: Omit<Trosak, 'id'>): Promise<Trosak>;
  updateExpense(tripId: string, expense: Trosak): Promise<Trosak>;
  removeExpense(tripId: string, expenseId: string): Promise<void>;

  // checklist
  addChecklistItem(tripId: string, item: Omit<ChecklistItem, 'id'>): Promise<ChecklistItem>;
  updateChecklistItem(tripId: string, item: ChecklistItem): Promise<ChecklistItem>;
  toggleChecklistItem(tripId: string, itemId: string, zavrseno: boolean): Promise<ChecklistItem>;
  removeChecklistItem(tripId: string, itemId: string): Promise<void>;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export class MockTripsService implements ITripsService {
  private trips: Trip[] = clone(SAMPLE_TRIPS);

  async list(): Promise<Trip[]> {
    await sleep(150);
    return clone(this.trips);
  }

  async get(id: string): Promise<Trip> {
    await sleep(120);
    const t = this.trips.find((x) => x.id === id);
    if (!t) throw new Error(`Plan ${id} ne postoji.`);
    return clone(t);
  }

  async create(payload: CreateTripRequest): Promise<Trip> {
    await sleep(200);
    if (new Date(payload.kraj) < new Date(payload.pocetak)) {
      throw new Error('Krajnji datum ne može biti pre početnog datuma.');
    }
    if (payload.budzet < 0) {
      throw new Error('Budžet ne može biti negativan.');
    }
    const trip: Trip = {
      ...payload,
      id: uid(),
      destinacije: [],
      aktivnosti: [],
      troskovi: [],
      checklist: [],
      saradnici: [],
    };
    this.trips = [trip, ...this.trips];
    return clone(trip);
  }

  async update(trip: Trip): Promise<Trip> {
    await sleep(150);
    if (new Date(trip.kraj) < new Date(trip.pocetak)) {
      throw new Error('Krajnji datum ne može biti pre početnog datuma.');
    }
    if (trip.budzet < 0) {
      throw new Error('Budžet ne može biti negativan.');
    }
    this.trips = this.trips.map((t) => (t.id === trip.id ? trip : t));
    return clone(trip);
  }

  async remove(id: string): Promise<void> {
    await sleep(150);
    this.trips = this.trips.filter((t) => t.id !== id);
  }

  // Stubs — the mock service exists for offline visual demos only;
  // nested mutations in checkpoint 10+ flow through HttpTripsService.
  private notSupported(): never {
    throw new Error('Nested mutations are only supported via HttpTripsService.');
  }

  addDestination = () => this.notSupported();
  updateDestination = () => this.notSupported();
  removeDestination = () => this.notSupported();
  addActivity = () => this.notSupported();
  updateActivity = () => this.notSupported();
  removeActivity = () => this.notSupported();
  addExpense = () => this.notSupported();
  updateExpense = () => this.notSupported();
  removeExpense = () => this.notSupported();
  addChecklistItem = () => this.notSupported();
  updateChecklistItem = () => this.notSupported();
  toggleChecklistItem = () => this.notSupported();
  removeChecklistItem = () => this.notSupported();
}
