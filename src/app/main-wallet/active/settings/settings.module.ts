import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { WalletSettingsComponent } from './settings.component';
import { MainSharedModule } from 'app/main/components/main-shared.module';
import { WalletBackupModalComponent } from './wallet-backup-modal/wallet-backup-modal.component';
import { ChangeWalletPasswordModalComponent } from './change-wallet-password-modal/change-wallet-password-modal.component';


const routes: Routes = [
  { path: '', component: WalletSettingsComponent, data: { title: 'Wallet Settings'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule,
    MainSharedModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    WalletSettingsComponent,
    WalletBackupModalComponent,
    ChangeWalletPasswordModalComponent,
  ],
  entryComponents: [
    WalletBackupModalComponent,
    ChangeWalletPasswordModalComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WalletSettingsModule { }
