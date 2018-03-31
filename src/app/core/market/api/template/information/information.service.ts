import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';

@Injectable()
export class InformationService {

  log: any = Log.create('information.service');

  constructor(private market: MarketService) {
  }

  public update(templateId: number, title: string, shortDesc: string, longDesc: string, categoryId: number) {
    return this.market.call('template',
      ['information', 'update', templateId, title, shortDesc, longDesc, categoryId]
    );
  }
}
