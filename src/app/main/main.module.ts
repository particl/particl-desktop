import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxsModule } from '@ngxs/store';

import { MainRoutingModule } from 'app/main/main-routing.module';
import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { MainState, WalletInfoState } from './store/main.state';

import { BaseComponent } from './base/base.component';
import { MultiwalletSidebarComponent } from './components/multiwallet/multiwallet-sidebar.component';
import { ApplicationRestartModalComponent } from './components/application-restart-modal/application-restart-modal.component';
import { ProcessingModalComponent } from './components/processing-modal/processing-modal.component';
import { ConsoleModalComponent } from './components/console-modal/console-modal.component';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { MainRpcService } from './services/main-rpc/main-rpc.service';
import { WalletInfoService } from './services/wallet-info/wallet-info.service';

@NgModule({
  declarations: [
    BaseComponent,
    MultiwalletSidebarComponent,
    ApplicationRestartModalComponent,
    ProcessingModalComponent,
    ConsoleModalComponent,
  ],
  imports: [
    MainRoutingModule,
    NgxsModule.forFeature([MainState, WalletInfoState]),
    CommonModule,
    CoreUiModule
  ],
  providers: [
    SnackbarService,
    MainRpcService,
    WalletInfoService
  ],
  entryComponents: [
    ApplicationRestartModalComponent,
    ProcessingModalComponent,
    ConsoleModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MainModule {
  constructor() {
  }
}
