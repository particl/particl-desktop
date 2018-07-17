import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MaterialModule } from 'app/core-ui/material/material.module';
import { MultiwalletModule } from 'app/multiwallet/multiwallet.module';

import { InstallerRouter, installer_routing } from './installer.router';
import { TestComponent } from './test/test.component';
import { CreateWalletComponent } from './create-wallet/create-wallet.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    MultiwalletModule
  ],
  exports: [
    InstallerRouter
  ],
  declarations: [
    InstallerRouter,
      TestComponent,
      CreateWalletComponent
    ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InstallerModule { }
