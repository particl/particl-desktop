import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
import { EncryptwalletComponent } from './encryptwallet/encryptwallet.component';
import { AlertComponent } from './shared/alert/alert.component';
/* shared in modals */
import { PassphraseComponent } from './createwallet/passphrase/passphrase.component';
import { PassphraseService } from './createwallet/passphrase/passphrase.service';
import { PasswordComponent } from './shared/password/password.component';
import { PercentageBarComponent } from './shared/percentage-bar/percentage-bar.component';

import { SnackbarService } from '../core/snackbar/snackbar.service';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    // BrowserAnimationsModule,
    ClipboardModule,
    /* own */
    MaterialModule
  ],
  declarations: [
    FocusDirective,
    FocusTimeoutDirective,
    ModalsComponent,
    PassphraseComponent,
    PasswordComponent,
    CreateWalletComponent,
    DaemonComponent,
    SyncingComponent,
    UnlockwalletComponent,
    EncryptwalletComponent,
    AlertComponent,
    ColdstakeComponent,
    PercentageBarComponent
  ],
  exports: [
    ModalsComponent
  ],
  providers: [
    ModalsService,
    PassphraseService,
    SnackbarService
  ],
  entryComponents: [
    ModalsComponent,
    DaemonComponent,
    SyncingComponent,
    UnlockwalletComponent,
    EncryptwalletComponent,
    AlertComponent
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
