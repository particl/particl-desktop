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
    toType: 'public',
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
    const input = this.send['fromType'];
    const output = this.send['toType'];
    const address = this.send['toAddress'];
    const amount = this.send['amount'];
    const comment = this.send['note'];
    const narration = this.send['note'];
    const substractfee = false;
    const ringsize = this.send['privacy'];
    const numsigs = 1;
    if(this.type === 'sendPayment') {
      this.SendService.sendTransaction(input, output, address, amount, comment, substractfee, narration, ringsize, numsigs);
    } else if (this.type === 'balanceTransfer') {
      this.SendService.transferBalance(input, output, amount, ringsize, numsigs);
    }
    this.clear();
  }

}
