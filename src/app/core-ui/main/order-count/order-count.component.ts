import { Component, Input } from '@angular/core';
import { Log } from 'ng2-logger';
import * as _ from 'lodash';

import { OrderStatusNotifierService } from 'app/core/market/order-status-notifier/order-status-notifier.service';

@Component({
  selector: 'app-order-count',
  templateUrl: './order-count.component.html',
  styleUrls: ['./order-count.component.scss']
})
export class OrderCountComponent {

  private log: any = Log.create('order-count.component id:' + Math.floor((Math.random() * 1000) + 1));

  @Input() type: string;
  constructor(
    private notify: OrderStatusNotifierService
  ) {}

}
