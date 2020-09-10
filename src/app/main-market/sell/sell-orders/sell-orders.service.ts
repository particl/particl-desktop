import { Injectable } from '@angular/core';
import { } from 'rxjs';
import {  } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { MarketState } from '../../store/market.state';

import { MarketRpcService } from '../../services/market-rpc/market-rpc.service';


@Injectable()
export class SellOrdersService {

  constructor(
    private _rpc: MarketRpcService,
    private _store: Store,
  ) {}

}
