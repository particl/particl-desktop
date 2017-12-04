import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-multiwallet',
  templateUrl: './multiwallet.component.html',
  styleUrls: ['./multiwallet.component.scss']
})
export class MultiwalletComponent implements OnInit {

  wallet_selection = ['wallet.dat', 'wallet-work.dat', 'wallet-old.dat', 'shop.dat'];

  constructor() { }

  ngOnInit() {
  }

}
