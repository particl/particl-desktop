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
    let input = this.send["fromType"];
    let output = this.send["toType"];
    let address = this.send["toAddress"];
    let amount = this.send["amount"];
    let comment = this.send["note"];
    let narration = this.send["note"];
    let substractfee = false;
    let ringsize = this.send["privacy"];
    let numsigs = 1;
    this.SendService.sendTransaction(input, output, address, amount, comment, substractfee, narration, ringsize, numsigs);
  }

}
