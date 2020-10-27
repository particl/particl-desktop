import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxsModule } from '@ngxs/store';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MainSharedModule } from 'app/main/components/main-shared.module';

import { MarketState } from './store/market.state';
import { MarketBaseComponent } from './base/market-base.component';
import { AlphaMainnetWarningComponent } from './base/alpha-mainnet-warning/alpha-mainnet-warning.component';
import { IdentityAddDetailsModalComponent } from './base/identity-add-modal/identity-add-details-modal.component';
import { MarketRpcService } from './services/market-rpc/market-rpc.service';
import { MarketSocketService } from './services/market-rpc/market-socket.service';
import { DataService } from './services/data/data.service';
import { RegionListService } from './services/region-list/region-list.service';
import { BidOrderService } from './services/orders/orders.service';
import { ListingCommentsService } from './services/comments/listing-comments.service';
import { MarketStartGuard } from './market.guard';


const routes: Routes = [
  {
    path: '',
    component: MarketBaseComponent,
    children: [
      { path: 'overview', canActivate: [MarketStartGuard],
        loadChildren: () => import('./overview/overview.module').then(m => m.OverviewModule) },
      { path: 'management', canActivate: [MarketStartGuard],
        loadChildren: () => import('./management/management.module').then(m => m.ManagementModule) },
      { path: 'listings', canActivate: [MarketStartGuard],
        loadChildren: () => import('./listings/listings.module').then(m => m.ListingsModule) },
      { path: 'cart', canActivate: [MarketStartGuard],
        loadChildren: () => import('./buy-checkout/buy-checkout.module').then(m => m.BuyCheckoutModule) },
      { path: 'buy', canActivate: [MarketStartGuard],
        loadChildren: () => import('./buy/buy.module').then(m => m.BuyModule) },
      { path: 'sell', canActivate: [MarketStartGuard],
        loadChildren: () => import('./sell/sell.module').then(m => m.SellModule) },
      { path: 'settings',
        loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule) },
      { path: 'loading',
        loadChildren: () => import('./loading/loading.module').then(m => m.LoadingModule) },
      { path: '**', redirectTo: 'overview' },
    ]
  }
];


@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    MainSharedModule,
    NgxsModule.forFeature(
      [MarketState]
    ),
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    MarketBaseComponent,
    AlphaMainnetWarningComponent,
    IdentityAddDetailsModalComponent
  ],
  entryComponents: [
    AlphaMainnetWarningComponent,
    IdentityAddDetailsModalComponent
  ],
  providers: [
    MarketStartGuard,
    MarketRpcService,
    MarketSocketService,
    DataService,
    RegionListService,
    BidOrderService,
    ListingCommentsService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MarketModule { }
