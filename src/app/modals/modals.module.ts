import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';

import { ModalsService } from './modals.service';
import { ModalsComponent } from './modals.component';

import { PassphraseComponent } from './shared/passphrase/passphrase.component';
import { PasswordComponent } from './shared/password/password.component';

import { FirsttimeComponent } from './firsttime/firsttime.component';
import { ShowpassphraseComponent } from './firsttime/showpassphrase/showpassphrase.component';
import { FinishComponent } from './firsttime/finish/finish.component';
import { GeneratewalletComponent } from './generatewallet/generatewallet.component';
import { RecoverwalletComponent } from './recoverwallet/recoverwallet.component';
import { SyncingComponent } from './syncing/syncing.component';
import { UnlockwalletComponent } from './unlockwallet/unlockwallet.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ModalModule,
  ],
  declarations: [
    ModalsComponent,
    PassphraseComponent,
    PasswordComponent,
    FirsttimeComponent,
    ShowpassphraseComponent,
    FinishComponent,
    GeneratewalletComponent,
    RecoverwalletComponent,
    SyncingComponent,
    UnlockwalletComponent
  ],
  exports: [
    ModalsComponent,
  ],
  providers: [ModalsService]
})
export class ModalsModule { }
