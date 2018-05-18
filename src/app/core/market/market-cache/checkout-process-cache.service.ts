import { Injectable } from '@angular/core';
import { ShippingDetails } from 'app/market/shared/shipping-details.model';

@Injectable()
export class CheckoutProcessCacheService {
  public shippingDetails: ShippingDetails;

  public selectedIndex: number = 0;
  public linear: boolean = true;
  public completed: boolean = false;

  constructor() {
    this.shippingDetails = new ShippingDetails();
  }

  public clear(): void {
    this.selectedIndex = 0;
    this.linear = true;
    this.shippingDetails = new ShippingDetails();
  }

}
