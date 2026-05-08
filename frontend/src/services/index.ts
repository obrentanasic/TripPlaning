import { HttpAuthService, type IAuthService } from './auth.service';
import { http } from './http';
import { HttpTripsService } from './http-trips.service';
import { HttpShareService, type IShareService } from './share.service';
import { type ITripsService } from './trips.service';

export interface Services {
  auth: IAuthService;
  trips: ITripsService;
  share: IShareService;
}

export const services: Services = {
  auth: new HttpAuthService(http),
  trips: new HttpTripsService(http),
  share: new HttpShareService(http),
};
