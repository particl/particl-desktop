import { CUSTOM_ELEMENTS_SCHEMA, NgModule, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes, Router, ActivationStart } from '@angular/router';

import { MaterialModule } from '../material/material.module';
import { DirectiveModule } from '../directive/directive.module';
import { ModalsModule } from 'app/modals/modals.module';

import { MainViewComponent } from './main-view.component';
import { StatusComponent } from './status/status.component';
import { OrderCountComponent } from './order-count/order-count.component';
import { ConsoleModalComponent } from './status/modal/help-modal/console-modal.component';
import { PercentageBarComponent } from '../../modals/shared/percentage-bar/percentage-bar.component';
import { AnnouncementNotificationComponent } from './announce-notification/announcement-notification.component';
import { VersionComponent } from './version/version.component';
import { ClientVersionService } from '../../core/http/client-version.service';
import { CartComponent } from './cart/cart.component';
import { TimeoffsetComponent } from './status/timeoffset/timeoffset.component';
import { CountBadgeComponent } from 'app/core-ui/main/shared/count-badge/count-badge.component';
import { MultiwalletModule } from 'app/multiwallet/multiwallet.module';
import { MarketService } from 'app/core/market/market.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { ProfileService } from 'app/core/market/api/profile/profile.service';

import { RpcService } from 'app/core/rpc/rpc.service';
import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';
import { CartService } from 'app/core/market/api/cart/cart.service';
import { CategoryService } from 'app/core/market/api/category/category.service';
import { FavoritesService } from 'app/core/market/api/favorites/favorites.service';
import { ReportService } from 'app/core/market/api/report/report.service';
import { ProposalsService } from 'app/wallet/proposals/proposals.service';
import { AddToCartCacheService } from 'app/core/market/market-cache/add-to-cart-cache.service';

import * as marketConfig from '../../../../modules/market/config.json';

const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  {
    path: 'main',
    component: MainViewComponent,
    children: [
      { path: '', redirectTo: 'wallet', pathMatch: 'full' },
      { path: 'wallet', loadChildren: '../../wallet/wallet.module#WalletViewsModule'},
      { path: 'market', loadChildren: '../../market/market.module#MarketModule'}
    ]
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ModalsModule,
    MaterialModule,
    DirectiveModule,
    MultiwalletModule
  ],
  exports: [
    MainViewComponent,
    PercentageBarComponent,
    CountBadgeComponent
  ],
  declarations: [
    MainViewComponent,
    StatusComponent,
    OrderCountComponent,
    PercentageBarComponent,
    ConsoleModalComponent,
    AnnouncementNotificationComponent,
    VersionComponent,
    CartComponent,
    TimeoffsetComponent,
    CountBadgeComponent
  ],
  entryComponents: [
    ConsoleModalComponent,
    AnnouncementNotificationComponent,
    VersionComponent
  ],
  providers: [
    ClientVersionService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MainViewModule implements OnDestroy {
  constructor(
    private _router: Router,
    private _rpc: RpcService,
    private _rpcState: RpcStateService,
    private _market: MarketService,
    private _marketState: MarketStateService,
    private _profile: ProfileService,
    private _cart: CartService,
    private _category: CategoryService,
    private _favorite: FavoritesService,
    private _report: ReportService,
    private _proposal: ProposalsService,
    private _addToCart: AddToCartCacheService
  ) {
    this._rpcState.start();

    this._rpc.call('smsgdisable').subscribe(
      () => this._rpc.call('smsgenable', [this._rpc.wallet]).subscribe()
    );

    if (this._rpc.wallet === marketConfig.marketWallet) {
      // We recheck if the market is started here for live reload cases
      this._market.startMarket().subscribe(
        () => {
          this._marketState.start();
          this._profile.start();
          this._cart.start();
          this._category.start();
          this._favorite.start();
          this._report.start();
          this._proposal.start();
          this._addToCart.start();
        }
      );
    }
  }

  ngOnDestroy() {
    this._rpcState.stop();

    if (this._market.isMarketStarted) {
      this._market.stopMarket();
      this._profile.stop();
      this._marketState.stop();
      this._cart.stop();
      this._category.stop();
      this._favorite.stop();
      this._report.stop();
      this._proposal.stop();
      this._addToCart.stop();
    }
  }
 }
