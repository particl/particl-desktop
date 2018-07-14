import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstallerRouterComponent } from './installer.component';

import { installer_routing } from './installer.routing';
import { TestComponent } from './test/test.component';
import { CreateWalletComponent } from './create-wallet/create-wallet.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
    //installer_routing
  ],
  exports: [
    InstallerRouterComponent
  ],
  declarations: [InstallerRouterComponent, TestComponent, CreateWalletComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InstallerModule { }
