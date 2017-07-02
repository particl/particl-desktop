import { Component, OnInit } from '@angular/core';
import { SendService } from './send.service';

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
    toType: 'private',
    currency: 'part',
    privacy: 50
  };

  constructor(private SendService: SendService) { }

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
    if (account === 'blind') {
      return (12345);
    }
    if (account === 'private') {
      return (54321);
    }
  }

  clear() {
    this.send = {
      fromType: 'public',
      toType: 'blind',
      currency: 'part',
      privacy: 50
    };
  }

  pay() {
    console.log(this.type, this.send);
    const input = this.send['fromType'];
    let output = this.send['toType'];
    const address = this.send['toAddress'];
    const amount = this.send['amount'];
    const comment = this.send['note'];
    const narration = this.send['note'];
    const substractfee = false;
    const ringsize = this.send['privacy'];
    const numsigs = 1;

    if (amount === undefined ) {
      alert('You need to enter an amount!');
      return;
    }


    if (this.type === 'balanceTransfer' && this.send['fromType'] === this.send['toType']) {
      alert('You have selected "' + this.send['fromType'] + '"" twice!\n Balance transfers can only happen between two different types.');
    }

    if (this.type === 'sendPayment') {
      output = input;

      if (address === undefined) {
        alert('You need to enter an address to send to!');
        return;
      }

      if (output === 'private' && address.indexOf('Tet') !== 0) {
        alert('Stealth address required for private transaction');
      }

      this.SendService.sendTransaction(input, output, address, amount, comment, substractfee, narration, ringsize, numsigs);
    } else if (this.type === 'balanceTransfer') {
      this.SendService.transferBalance(input, output, address, amount, ringsize, numsigs);
    }
    this.clear();
  }

}
