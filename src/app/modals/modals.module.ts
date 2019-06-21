import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../core-ui/material/material.module';
import { DirectiveModule } from '../core-ui/directive/directive.module';

import { ModalsHelperService } from 'app/modals/modals-helper.service';

/* modals */
import { ColdstakeComponent } from './coldstake/coldstake.component';
import { SyncingComponent } from './syncing/syncing.component';
import { UnlockwalletComponent } from './unlockwallet/unlockwallet.component';
import { EncryptwalletComponent } from './encryptwallet/encryptwallet.component';
import { AlertComponent } from './shared/alert/alert.component';

/* shared in modals */
import { PasswordComponent } from './shared/password/password.component';
import { MultiwalletComponent } from './multiwallet/multiwallet.component';

import { SnackbarService } from '../core/snackbar/snackbar.service';
import { ManageWidgetsComponent } from './manage-widgets/manage-widgets.component';
import { SendConfirmationModalComponent } from 'app/modals/send-confirmation-modal/send-confirmation-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    ClipboardModule,
    /* own */
    MaterialModule,
    DirectiveModule
  ],
  declarations: [
    PasswordComponent,
    SyncingComponent,
    UnlockwalletComponent,
    EncryptwalletComponent,
    AlertComponent,
    ColdstakeComponent,
    MultiwalletComponent,
    ManageWidgetsComponent,
    SendConfirmationModalComponent
  ],
  exports: [
    ClipboardModule
  ],
  providers: [
    // @TODO rename ModalsHelperService and replace with the modalsService once modals service refactored.
    ModalsHelperService,
    SnackbarService
  ],
  entryComponents: [
    SyncingComponent,
    UnlockwalletComponent,
    EncryptwalletComponent,
    AlertComponent,
    ManageWidgetsComponent,
    ColdstakeComponent,
    SendConfirmationModalComponent
  ],
})
export class ModalsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ModalsModule,
      providers: [
        ModalsHelperService
      ]
    };
  }
}

export { ModalsHelperService } from './modals-helper.service';
