import { Component, Input, OnInit } from '@angular/core';
import { Log } from 'ng2-logger';

import { CountryListService } from 'app/core/market/api/countrylist/countrylist.service';

@Component({
  selector: 'app-shipping-address',
  templateUrl: './shipping-address.component.html',
  styleUrls: ['./shipping-address.component.scss']
})
export class ShippingAddressComponent {

  private log: any = Log.create('shipping-address.component id:' + Math.floor((Math.random() * 1000) + 1));

  @Input() shippingAddress: any;
  constructor(
    public countryList: CountryListService
  ) {}

  // May be move to shipping model ?
  get addressLine2(): string {
    if (this.shippingAddress) {
      return this.shippingAddress.addressLine2 ? this.shippingAddress.addressLine2 + '' : '' // FIXME: "," removed, do we still need this?
    }
    return '';
  }

  get state(): string {
    if (this.shippingAddress) {
      return this.shippingAddress.state ? '' + this.shippingAddress.state : '' // FIXME: "," removed, do we still need this?
    }
    return '';
  }

  get country(): string {
    if (this.shippingAddress) {
      const country = this.countryList.getCountryByRegion(this.shippingAddress.country)
      return country ? country.name : '';
    }
    return '';
  }
}
