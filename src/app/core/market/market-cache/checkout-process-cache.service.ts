import { Injectable } from '@angular/core';
import { ShippingDetails } from 'app/market/shared/shipping-details.model';

@Injectable()
export class CheckoutProcessCacheService {
  public shippingDetails: ShippingDetails;
  public stepper: number = 0;
  constructor() {
    this.shippingDetails = new ShippingDetails();
  }

}
