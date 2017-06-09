import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-send',
  templateUrl: './send.component.html',
  // TODO merge / globalize styles
  styleUrls: ['./send.component.scss', '../../settings/settings.component.scss']
})
export class SendComponent implements OnInit {

  type: string = 'sendPayment';
  advanced: boolean = false;
  send: Object = {
    fromType: 'public',
    toType: 'public',
    currency: 'part',
    privacy: 50
  };

  constructor() { }

  ngOnInit() {
  }

  sendTab(type: string) {
    this.type = type;
  }

  toggleAdvanced() {
    this.advanced = !this.advanced;
  }

  getBalance(account: string) {
    if (account === 'public') {
      return (12345);
    }
    if (account === 'private') {
      return (54321);
    }
  }

  clear() {
    this.send = {
      fromType: 'public',
      toType: 'public',
      currency: 'part',
      privacy: 50
    };
  }

  pay() {
    console.log(this.type, this.send);
  }

}
