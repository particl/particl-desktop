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

  get country(): string {
    if (this.shippingAddress) {
      const country = this.countryList.getCountryByRegion(this.shippingAddress.country)
      return country ? country.name : '';
    }
    return '';
  }
}
