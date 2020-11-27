import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxsModule } from '@ngxs/store';

import { MainRoutingModule } from 'app/main/main-routing.module';
import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { MainState, WalletInfoState, WalletStakingState, WalletUTXOState, WalletSettingsState } from './store/main.state';

import { BaseComponent } from './base/base.component';
import { MultiwalletSidebarComponent } from './components/multiwallet/multiwallet-sidebar.component';
import { ApplicationRestartModalComponent } from './components/application-restart-modal/application-restart-modal.component';
import { ProcessingModalComponent } from './components/processing-modal/processing-modal.component';
import { ConsoleModalComponent } from './components/console-modal/console-modal.component';
import { UnlockwalletModalComponent } from './components/unlock-wallet-modal/unlock-wallet-modal.component';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { MainRpcService } from './services/main-rpc/main-rpc.service';
import { WalletInfoService } from './services/wallet-info/wallet-info.service';
import { WalletEncryptionService } from './services/wallet-encryption/wallet-encryption.service';
import { NotificationsService } from './services/notifications/notifications.service';
import { EncryptwalletModalComponent } from './components/encrypt-wallet-modal/encrypt-wallet-modal.component';
import { BlockSyncModalComponent } from './components/block-sync-indicator/block-sync-modal/block-sync-modal.component';

@NgModule({
  declarations: [
    BaseComponent,
    MultiwalletSidebarComponent,
    ApplicationRestartModalComponent,
    ProcessingModalComponent,
    ConsoleModalComponent,
    UnlockwalletModalComponent,
    EncryptwalletModalComponent,
    BlockSyncModalComponent,
  ],
  imports: [
    MainRoutingModule,
    NgxsModule.forFeature(
      [MainState, WalletInfoState, WalletStakingState, WalletUTXOState, WalletSettingsState]
    ),
    CommonModule,
    CoreUiModule
  ],
  providers: [
    SnackbarService,
    MainRpcService,
    WalletInfoService,
    WalletEncryptionService,
    NotificationsService
  ],
  entryComponents: [
    ApplicationRestartModalComponent,
    ProcessingModalComponent,
    ConsoleModalComponent,
    UnlockwalletModalComponent,
    EncryptwalletModalComponent,
    BlockSyncModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MainModule {
  constructor() {
  }
}
