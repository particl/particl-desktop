import { CUSTOM_ELEMENTS_SCHEMA, NgModule, ModuleWithProviders, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes, ParamMap, Router, NavigationStart } from '@angular/router';

import { CoreModule, RpcService } from '../../core/core.module';
import { MaterialModule } from '../material/material.module';
import { DirectiveModule } from '../directive/directive.module';
import { ModalsModule } from 'app/modals/modals.module';

import { MainRouterComponent } from './main.router';

import { StatusComponent } from './status/status.component';
import { OrderCountComponent } from './order-count/order-count.component';
import { ConsoleModalComponent } from './status/modal/help-modal/console-modal.component';
import { BlockSyncBarComponent } from './block-sync-bar/block-sync-bar.component';
import { ReleaseNotificationComponent } from './release-notification/release-notification.component';
import { CartComponent } from './cart/cart.component';
import { TimeoffsetComponent } from './status/timeoffset/timeoffset.component';
import { CountBadgeComponent } from 'app/core-ui/main/shared/count-badge/count-badge.component';
import { ClientVersionService } from '../../core/http/client-version.service';
import { MultiwalletModule } from 'app/multiwallet/multiwallet.module';


const routes: Routes = [
  { path: '', redirectTo: 'main', pathMatch: 'full' },
  {
    path: 'main',
    component: MainRouterComponent,
    children: [
      { path: '', redirectTo: 'wallet', pathMatch: 'full' },
      { path: 'wallet', loadChildren: '../../wallet/wallet.module#WalletViewsModule'},
      { path: 'market', loadChildren: '../../market/market.module#MarketModule'}
    ]
  }
];

const main_routing: ModuleWithProviders = RouterModule.forChild(routes);

@NgModule({
  imports: [
    CommonModule,
    main_routing,
    CoreModule.forChild(),
    ModalsModule,
    MaterialModule,
    DirectiveModule,
    MultiwalletModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    MainRouterComponent,
    StatusComponent,
    OrderCountComponent,
    BlockSyncBarComponent,
    ConsoleModalComponent,
    ReleaseNotificationComponent,
    CartComponent,
    TimeoffsetComponent,
    CountBadgeComponent
  ],
  entryComponents: [
    MainRouterComponent,
    ConsoleModalComponent,
    ReleaseNotificationComponent
  ],
  providers: [
    ClientVersionService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MainModule implements OnDestroy {
  constructor(
    private _router: Router,
    private _rpc: RpcService
  ) {
    console.log('MainModule launched!');
    // Not the prettiest code, but it listens to all router events
    // and if one includes the wallet parameter, it will grab it
    // and set the rpc wallet.
    const loadWallet = this._router.events.subscribe((event: any) => {
      if (event.snapshot && event.snapshot.params['wallet']) {
        this._rpc.wallet = event.snapshot.params['wallet'];
        loadWallet.unsubscribe();
      }
    });
  }

  ngOnDestroy() {
    console.log('MainModule destroyed!');
  }
 }
