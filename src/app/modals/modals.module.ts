import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../core-ui/material/material.module';

import { ModalsService } from './modals.service';

import { ModalsComponent } from './modals.component';
import { FocusDirective, FocusTimeoutDirective } from './modals.directives';

/* modals */
import { CreateWalletComponent } from './createwallet/createwallet.component';
import { ColdstakeComponent } from './coldstake/coldstake.component';
import { DaemonComponent } from './daemon/daemon.component';
import { SyncingComponent } from './syncing/syncing.component';
import { UnlockwalletComponent } from './unlockwallet/unlockwallet.component';
import { AlertComponent } from './shared/alert/alert.component';
/* shared in modals */

import { PasswordComponent } from './shared/password/password.component';
import { MultiwalletComponent } from './multiwallet/multiwallet.component';

import { SnackbarService } from '../core/snackbar/snackbar.service';
import { DaemonConnectionComponent } from './shared/daemon-connection/daemon-connection.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    ClipboardModule,
    /* own */
    MaterialModule
  ],
  declarations: [
    FocusDirective,
    FocusTimeoutDirective,
    ModalsComponent,
    PasswordComponent,
    CreateWalletComponent,
    DaemonComponent,
    SyncingComponent,
    UnlockwalletComponent,
    AlertComponent,
    ColdstakeComponent,
    MultiwalletComponent,
    DaemonConnectionComponent
  ],
  exports: [
    ModalsComponent,
    ClipboardModule,
    FocusDirective, // used in new create-wallet
    FocusTimeoutDirective, // used in new create-wallet
    PasswordComponent, // used in new create-wallet
    UnlockwalletComponent // used in new create-wallet
  ],
  providers: [
    ModalsService,
    SnackbarService
  ],
  entryComponents: [
    ModalsComponent,
    DaemonComponent,
    SyncingComponent,
    UnlockwalletComponent,
    AlertComponent,
    DaemonConnectionComponent
  ],
})
export class ModalsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ModalsModule,
      providers: [
        ModalsService
      ]
    };
  }
}

export { ModalsService } from './modals.service';
