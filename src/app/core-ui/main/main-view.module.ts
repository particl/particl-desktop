import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MaterialModule } from '../material/material.module';

import { MainViewComponent } from './main-view.component';
import { StatusComponent } from './status/status.component';

/* Main-view loads WalletModule */
import { WalletModule } from '../../wallet/wallet/wallet.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    WalletModule
  ],
  exports: [
    MainViewComponent,
    // StatusComponent,
  ],
  declarations: [
    MainViewComponent,
    StatusComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MainViewModule { }
