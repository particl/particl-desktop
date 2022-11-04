import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { WalletSharedModule } from '../../shared/wallet-shared.module';

import { WalletHistoryComponent } from './history.component';


const routes: Routes = [
  { path: '', component: WalletHistoryComponent, data: { title: 'History'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule,
    WalletSharedModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    WalletHistoryComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class HistoryModule { }
