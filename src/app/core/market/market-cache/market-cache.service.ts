import { Injectable, OnDestroy } from '@angular/core';
import { StateService } from '../..//state/state.service';

@Injectable()
export class MarketCacheService extends StateService implements OnDestroy {

  constructor() {
    super();
   }

  ngOnDestroy() {
    this
  }
}
