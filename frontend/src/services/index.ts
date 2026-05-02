import { MockAuthService, type IAuthService } from './auth.service';
import { MockTripsService, type ITripsService } from './trips.service';

export interface Services {
  auth: IAuthService;
  trips: ITripsService;
}

export const services: Services = {
  auth: new MockAuthService(),
  trips: new MockTripsService(),
};
