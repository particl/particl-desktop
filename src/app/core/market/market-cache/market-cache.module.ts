import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketUiCacheService } from './market-ui-cache.service';
import { FavoriteCacheService } from './favorite-cache.service';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class MarketCacheModule { 
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MarketCacheModule,
      providers: [
        MarketUiCacheService,
        FavoriteCacheService,
      ]
    };
  }
}
