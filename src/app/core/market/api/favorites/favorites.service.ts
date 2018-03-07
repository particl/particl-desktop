import { Injectable } from '@angular/core';

import { MarketService } from 'app/core/market/market.service';

@Injectable()
export class FavoritesService {

  constructor(
    private market: MarketService
  ) { }

  addItem(id: number) {
    return this.market.call('favorite', ['add', 1, id]);
  }

  removeItem(id: number) {
    return this.market.call('favorite', ['remove', 1, id]);
  }

  getFavorites() {
    return this.market.call('favorite', ['list', 1])
  }
}
