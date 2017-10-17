import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule, TooltipModule } from 'ngx-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';

import { ModalsService } from './modals.service';
import { PassphraseService } from './createwallet/passphrase/passphrase.service';
import { ModalsComponent } from './modals.component';
import { FocusDirective, FocusTimeoutDirective } from './modals.directives';

import { PassphraseComponent } from './createwallet/passphrase/passphrase.component';
import { PasswordComponent } from './shared/password/password.component';

import { CreateWalletComponent } from './createwallet/createwallet.component';
import { ColdstakeComponent } from './coldstake/coldstake.component';
import { DaemonComponent } from './daemon/daemon.component';
import { SyncingComponent } from './syncing/syncing.component';
import { UnlockwalletComponent } from './unlockwallet/unlockwallet.component';
import { EncryptwalletComponent } from './encryptwallet/encryptwallet.component';
import { AlertComponent } from './shared/alert/alert.component';
import {
  MdButtonModule, MdCheckboxModule, MdDialogModule, MdIconModule, MdInputModule,
  MdTooltipModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FlashNotificationService } from '../services/flash-notification.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ClipboardModule,
    MdDialogModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    MdButtonModule,
    MdIconModule,
    MdInputModule,
    MdCheckboxModule,
    ModalModule,
    MdTooltipModule,
    TooltipModule,
    ClipboardModule
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
    ColdstakeComponent
  ],
  exports: [
    ModalsComponent
  ],
  providers: [
    ModalsService,
    PassphraseService,
    FlashNotificationService
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
export class ModalsModule { }
