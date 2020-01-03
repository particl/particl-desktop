import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger';
import { MarketService } from 'app/core/market/market.service';

@Injectable()
export class ShippingService {

  log: any = Log.create('shipping.service');

  constructor(private market: MarketService) { }

  public add(templateId: number, country: string) {
    return this.market.call('template', ['shipping', 'add', templateId, country]);
  }

  public list(templateId: number) {
    return this.market.call('template', ['shipping', 'list', templateId]);
  }

  public remove(templateId: number) {
    return this.market.call('template', ['shipping', 'remove', templateId]);
  }
}
