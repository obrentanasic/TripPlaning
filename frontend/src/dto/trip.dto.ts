import type { Trip } from '../models/Trip';

export type CreateTripRequest = Omit<
  Trip,
  'id' | 'destinacije' | 'aktivnosti' | 'troskovi' | 'checklist'
>;

export type UpdateTripRequest = Partial<CreateTripRequest> & { id: string };
