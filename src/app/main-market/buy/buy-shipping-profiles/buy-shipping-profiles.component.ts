import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'market-buy-shipping-profiles',
  templateUrl: './buy-shipping-profiles.component.html',
  styleUrls: ['./buy-shipping-profiles.component.scss']
})
export class BuyShippingProfilesComponent implements OnInit {

  searchQuery: FormControl = new FormControl('');

  public filters: any = {
    search: undefined
  };

  constructor() { }

  ngOnInit() {
  }

}
