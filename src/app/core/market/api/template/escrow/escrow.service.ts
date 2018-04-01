import { Injectable } from '@angular/core';
import { Log } from 'ng2-logger';

import { MarketService } from 'app/core/market/market.service';

export enum EscrowType {
  NOP = 'NOP',
  MAD = 'MAD'
}

@Injectable()
export class EscrowService {

  log: any = Log.create('escrow.service');

  constructor(private market: MarketService) { }

  add(templateId: number, escrowType: EscrowType) {
    return this.market.call('template', ['escrow', 'add', templateId, escrowType, 100, 100]);
  }

  update(templateId: number, escrowType: EscrowType) {
    return this.market.call('template', ['escrow', 'update', templateId, escrowType, 100, 100]);
  }
}
