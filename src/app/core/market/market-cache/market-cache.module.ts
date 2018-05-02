import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostListingCacheService } from './post-listing-cache.service';
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
        PostListingCacheService,
        FavoriteCacheService,
      ]
    };
  }
}
