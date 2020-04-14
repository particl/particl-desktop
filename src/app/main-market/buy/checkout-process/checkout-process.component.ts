import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-checkout-process',
  templateUrl: './checkout-process.component.html',
  styleUrls: ['./checkout-process.component.scss']
})
export class CheckoutProcessComponent implements OnInit {

  saveShippingProfile = false;

  constructor() { }

  ngOnInit() {
  }

}
