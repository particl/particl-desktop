import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../core-ui/material/material.module';
import { DirectiveModule } from '../core-ui/directive/directive.module';

import { ModalsHelperService } from 'app/modals/modals-helper.service';
/* modals */
import { TermsComponent } from './terms/terms.component';
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

import { ReportModalComponent } from './report-modal/report-modal.component';

import { PlaceOrderComponent } from './market-place-order/place-order.component';
import { ShippingComponent } from './market-shipping/shipping.component';

import { SendConfirmationModalComponent } from 'app/modals/send-confirmation-modal/send-confirmation-modal.component';
import {
  ProposalConfirmationComponent
} from 'app/modals/proposal-confirmation/proposal-confirmation.component';
import {
  ProposalVoteConfirmationComponent
} from 'app/modals/proposal-vote-confirmation/proposal-vote-confirmation.component';

import { BidConfirmationModalComponent } from 'app/modals/market-bid-confirmation-modal/bid-confirmation-modal.component';
import { ListingExpirationComponent } from './market-listing-expiration/listing-expiration.component';
import { RejectBidComponent } from './reject-bid/reject-bid.component';

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
    PassphraseComponent,
    PasswordComponent,
    TermsComponent,
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
    ReportModalComponent,
    ShippingComponent,
    SendConfirmationModalComponent,
    ProposalConfirmationComponent,
    ProposalVoteConfirmationComponent,
    BidConfirmationModalComponent,
    ListingExpirationComponent,
    RejectBidComponent
  ],
  exports: [
    ClipboardModule
  ],
  providers: [
    // @TODO rename ModalsHelperService and replace with the modalsService once modals service refactored.
    ModalsHelperService,
    PassphraseService,
    SnackbarService
  ],
  entryComponents: [
    DaemonComponent,
    TermsComponent,
    SyncingComponent,
    UnlockwalletComponent,
    EncryptwalletComponent,
    AlertComponent,
    DaemonConnectionComponent,
    DeleteListingComponent,
    ManageWidgetsComponent,
    PlaceOrderComponent,
    ReportModalComponent,
    ShippingComponent,
    CreateWalletComponent,
    ColdstakeComponent,
    SendConfirmationModalComponent,
    ProposalConfirmationComponent,
    ProposalVoteConfirmationComponent,
    BidConfirmationModalComponent,
    ListingExpirationComponent,
    RejectBidComponent
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
export { PassphraseService } from './createwallet/passphrase/passphrase.service';
