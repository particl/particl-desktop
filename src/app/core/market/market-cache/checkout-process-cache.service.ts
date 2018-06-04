import { Injectable } from '@angular/core';
import { Address } from 'app/core/market/api/profile/address/address.model';

@Injectable()
export class CheckoutProcessCacheService {
  public address: Address;

  public selectedIndex: number = 0;
  public linear: boolean = true;
  public completed: boolean = false;

  constructor() {
    this.address = new Address();
  }

  public clear(): void {
    this.selectedIndex = 0;
    this.linear = true;
    this.address = new Address();
  }

}
