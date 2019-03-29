import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger';
import { MarketService } from 'app/core/market/market.service';

@Injectable()
export class PaymentService {

  log: any = Log.create('shipping.service');

  constructor(private market: MarketService) {
  }

  public update(
    templateId: number,
    basePrice: number,
    domesticPrice: number,
    internationalPrice: number,
    paymentAddress?: string // TODO: class
  ) {
    return this.market.call('template',
      [
        'payment',
        'update',
        templateId,
        'SALE',
        'PARTICL',
        basePrice,
        domesticPrice,
        internationalPrice,
        paymentAddress
      ]
    );
  }

}
