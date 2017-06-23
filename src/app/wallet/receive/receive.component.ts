import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-receive',
  templateUrl: './receive.component.html',
  styleUrls: ['./receive.component.scss']
})
export class ReceiveComponent implements OnInit {

  type: string = 'public';

  privateAddress: string = "PwGP8BzRUHQwchwwPuzAe9WqskgmTLNx8F";
  publicAddress: string = "934KDFJ349d9fkjjcjdsrFKJDXCcFGKJDJCxx";

  addresses: Object[] = [
    {
    }
  ];

  address = {
      id: 249,
      label: "I'm label one",
      address: this.publicAddress,
      readable: this.publicAddress.match(/.{1,4}/g),
      balance: 2000.30
  }

  qr = {
    el: undefined,
    size: undefined
  }

  constructor() { }

  ngOnInit() {
    // QR
    this.qr.el = document.getElementsByClassName("card qr")[0];
    this.qr.size = this.qr.el.offsetWidth - 40;
    window.onresize = () => this.qr.size = this.qr.el.offsetWidth - 40;
  }

  selectInput() {
    let input: any = document.getElementsByClassName('header-input')[0];
    input.select();
  }

}
