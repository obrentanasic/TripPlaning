import { HttpAuthService, type IAuthService } from './auth.service';
import { http } from './http';
import { MockTripsService, type ITripsService } from './trips.service';

export interface Services {
  auth: IAuthService;
  trips: ITripsService;
}

export const services: Services = {
  auth: new HttpAuthService(http),
  trips: new MockTripsService(),
};
