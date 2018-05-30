import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../core-ui/material/material.module';
import { DirectiveModule } from '../core-ui/directive/directive.module';

import { ModalsService } from './modals.service';
import { ModalsHelperService } from 'app/modals/modals-helper.service';
import { ModalsComponent } from './modals.component';

/* modals */
import { CreateWalletComponent } from './createwallet/createwallet.component';
import { ColdstakeComponent } from './coldstake/coldstake.component';
import { DaemonComponent } from './daemon/daemon.component';
import { SyncingComponent } from './syncing/syncing.component';
import { UnlockwalletComponent } from './unlockwallet/unlockwallet.component';
import { EncryptwalletComponent } from './encryptwallet/encryptwallet.component';
import { AlertComponent } from './shared/alert/alert.component';
import { DeleteListingComponent } from './delete-listing/delete-listing.component';

/* shared in modals */
import { PassphraseComponent } from './createwallet/passphrase/passphrase.component';
import { PassphraseService } from './createwallet/passphrase/passphrase.service';
import { PasswordComponent } from './shared/password/password.component';
import { MultiwalletComponent } from './multiwallet/multiwallet.component';

import { SnackbarService } from '../core/snackbar/snackbar.service';
import { DaemonConnectionComponent } from './shared/daemon-connection/daemon-connection.component';
import { ManageWidgetsComponent } from './manage-widgets/manage-widgets.component';
import { PlaceOrderComponent } from './place-order/place-order.component';
import { ShippingComponent } from './shipping/shipping.component';


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
    MultiwalletComponent,
    DaemonConnectionComponent,
    DeleteListingComponent,
    ManageWidgetsComponent,
    PlaceOrderComponent,
    ShippingComponent
  ],
  exports: [
    ModalsComponent,
    ClipboardModule
  ],
  providers: [
    ModalsService,

    // @TODO rename ModalsHelperService and replace with the modalsService once modals service refactored.
    ModalsHelperService,
    PassphraseService,
    SnackbarService
  ],
  entryComponents: [
    ModalsComponent,
    DaemonComponent,
    SyncingComponent,
    UnlockwalletComponent,
    EncryptwalletComponent,
    AlertComponent,
    DaemonConnectionComponent,
    DeleteListingComponent,
    ManageWidgetsComponent,
    PlaceOrderComponent,
    ShippingComponent
  ],
})
export class ModalsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ModalsModule,
      providers: [
        ModalsService,
        ModalsHelperService
      ]
    };
  }
}

export { ModalsHelperService } from './modals-helper.service';
export { ModalsService } from './modals.service';
export { PassphraseService } from './createwallet/passphrase/passphrase.service';
