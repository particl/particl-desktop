import { CUSTOM_ELEMENTS_SCHEMA, NgModule, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material';

import { MaterialModule } from '../material/material.module';
import { DirectiveModule } from '../directive/directive.module';
import { ModalsModule } from 'app/modals/modals.module';

import { MainRouterComponent } from './main.router';

import { StatusComponent } from './status/status.component';
import { OrderCountComponent } from './order-count/order-count.component';
import { ConsoleModalComponent } from './status/modal/help-modal/console-modal.component';
import { BlockSyncBarComponent } from './block-sync-bar/block-sync-bar.component';
import { AnnouncementNotificationComponent } from './announce-notification/announcement-notification.component';
import { VersionComponent } from './version/version.component';
import { CartComponent } from './cart/cart.component';
import { TimeoffsetComponent } from './status/timeoffset/timeoffset.component';
import { CountBadgeComponent } from 'app/core-ui/main/shared/count-badge/count-badge.component';
import { ClientVersionService } from '../../core/http/client-version.service';
import { MultiwalletModule } from 'app/multiwallet/multiwallet.module';
import { CoreUiModule } from '../core-ui.module';

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

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ModalsModule,
    MaterialModule,
    MatIconModule,
    DirectiveModule,
    MultiwalletModule,
    CoreUiModule
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
export class MainModule implements OnDestroy {
  constructor(
  ) {
    console.log('MainModule launched!');
  }

  ngOnDestroy() {
    console.log('MainModule destroyed!');
  }
 }
