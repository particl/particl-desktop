import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { ClipboardModule } from 'ngx-clipboard';

import { WalletSharedModule } from '../../shared/wallet-shared.module';
import { ReceiveComponent } from './receive.component';
import { ReceiveHistoryComponent } from './receive-history/receive-history.component';




const routes: Routes = [
  { path: '', component: ReceiveComponent, data: { title: 'Receive'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule,
    ClipboardModule,
    WalletSharedModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    ReceiveComponent,
    ReceiveHistoryComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ReceiveModule { }
