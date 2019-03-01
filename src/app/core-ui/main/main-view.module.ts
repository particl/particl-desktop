import { CUSTOM_ELEMENTS_SCHEMA, NgModule, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes, Router, ActivationStart } from '@angular/router';

import { CoreModule } from '../../core/core.module';
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
// import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { RpcService } from 'app/core/rpc/rpc.service';
import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';

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
    CoreModule.forChild(),
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
    private _rpcState: RpcStateService
  ) {
    console.log('MainViewModule launched!');
    // Not the prettiest code, but it listens to all router events
    // and if one includes the wallet parameter, it will grab it
    // and set the rpc wallet.
    this._router.events
      .filter(e => e instanceof ActivationStart)
      .take(1)
      .subscribe((event: any) => {
        const wallet = event.snapshot.params['wallet'];
        this._rpc.wallet = wallet === '[default]' ? '' : wallet;

        this._rpcState.start();
      });
  }

  ngOnDestroy() {
    console.log('Stoppping MainModule!');
    this._rpcState.stop();
    console.log('MainModule destroyed!');
  }
 }
