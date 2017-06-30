import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap';

import { ModalsService } from './modals.service';
import { ModalsComponent } from './modals.component';

import { UnlockwalletComponent } from './shared/unlockwallet/unlockwallet.component';
import { SyncingComponent } from './syncing/syncing.component';
import { RecoverwalletComponent } from './recoverwallet/recoverwallet.component';
import { GeneratewalletComponent } from './generatewallet/generatewallet.component';
import { FirsttimeComponent } from './firsttime/firsttime.component';
import { PassphraseComponent } from './passphrase/passphrase.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ModalModule
  ],
  declarations: [
    ModalsComponent,
    UnlockwalletComponent,
    SyncingComponent,
    RecoverwalletComponent,
    GeneratewalletComponent,
    FirsttimeComponent,
    PassphraseComponent,
  ],
  exports: [
    ModalsComponent
  ],
  providers: [ModalsService]
})
export class ModalsModule { }
