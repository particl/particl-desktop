import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { MarketService } from './market.service';
import { MarketStateService } from './market-state/market-state.service';

import { CategoryService } from './api/category/category.service';
import { ProfileService } from './api/profile/profile.service';
import { TemplateService } from './api/template/template.service';
import { ListingService } from './api/listing/listing.service';
import { CartService } from './api/cart/cart.service';
import { CountryListService } from './api/countrylist/countrylist.service';
import { FavoritesService } from './api/favorites/favorites.service';
import { ImageService } from './api/template/image/image.service';
import { InformationService } from './api/template/information/information.service';
import { LocationService } from './api/template/location/location.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  declarations: []
})
export class MarketModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MarketModule,
      providers: [
        MarketService,
        MarketStateService,
        // API
        CategoryService,
        ProfileService,
        TemplateService,
        ListingService,
        CartService,
        CountryListService,
        FavoritesService,
        ImageService,
        InformationService,
        LocationService
      ]
    };
  }
}
