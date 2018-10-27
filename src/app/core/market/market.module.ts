import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MarketCacheModule } from './market-cache/market-cache.module';

import { MarketService } from './market.service';
import { MarketStateService } from './market-state/market-state.service';

import { CategoryService } from './api/category/category.service';
import { ProfileService } from './api/profile/profile.service';
import { AddressService } from './api/profile/address/address.service';
import { TemplateService } from './api/template/template.service';
import { ListingService } from './api/listing/listing.service';
import { CartService } from './api/cart/cart.service';
import { CountryListService } from './api/countrylist/countrylist.service';
import { FavoritesService } from './api/favorites/favorites.service';
import { ReportService } from './api/report/report.service';
import { ImageService } from './api/template/image/image.service';
import { InformationService } from './api/template/information/information.service';
import { LocationService } from './api/template/location/location.service';
import { EscrowService } from './api/template/escrow/escrow.service';
import { BidService } from './api/bid/bid.service';
import { OrderStatusNotifierService } from './order-status-notifier/order-status-notifier.service';
import { ProposalsService } from 'app/wallet/proposals/proposals.service';
import { ProposalsNotificationsService } from './proposals-notifier/proposals-notifications.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    MarketCacheModule.forRoot()
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
        AddressService,
        TemplateService,
        ListingService,
        CartService,
        CountryListService,
        FavoritesService,
        ReportService,
        ImageService,
        InformationService,
        LocationService,
        EscrowService,
        BidService,
        OrderStatusNotifierService,
        ProposalsService,
        ProposalsNotificationsService
      ]
    };
  }
}

export { MarketService } from './market.service';
