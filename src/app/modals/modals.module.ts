import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';

import { MaterialModule } from '../core-ui/material/material.module';
import { DirectiveModule } from '../core-ui/directive/directive.module';

import { ModalsHelperService } from 'app/modals/modals-helper.service';
/* modals */
import { ColdstakeComponent } from './coldstake/coldstake.component';
import { DaemonComponent } from './daemon/daemon.component';
import { SyncingComponent } from './syncing/syncing.component';
import { UnlockwalletComponent } from './unlockwallet/unlockwallet.component';
import { EncryptwalletComponent } from './encryptwallet/encryptwallet.component';
import { AlertComponent } from './shared/alert/alert.component';
import { DeleteListingComponent } from './delete-listing/delete-listing.component';

/* shared in modals */
import { PasswordComponent } from './shared/password/password.component';

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
import { ProcessingModalComponent } from './processing-modal/processing-modal.component';
import { AlphaMainnetWarningComponent } from './alpha-mainnet-warning/alpha-mainnet-warning.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ClipboardModule,
    /* own */
    MaterialModule,
    DirectiveModule
  ],
  declarations: [
    PasswordComponent,
    DaemonComponent,
    SyncingComponent,
    UnlockwalletComponent,
    EncryptwalletComponent,
    AlertComponent,
    ColdstakeComponent,
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
    ProcessingModalComponent,
    AlphaMainnetWarningComponent
  ],
  exports: [
    ClipboardModule
  ],
  providers: [
    // @TODO rename ModalsHelperService and replace with the modalsService once modals service refactored.
    ModalsHelperService
  ],
  entryComponents: [
    DaemonComponent,
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
    ColdstakeComponent,
    SendConfirmationModalComponent,
    ProposalConfirmationComponent,
    ProposalVoteConfirmationComponent,
    BidConfirmationModalComponent,
    ListingExpirationComponent,
    ProcessingModalComponent,
    AlphaMainnetWarningComponent
  ],
})
export class ModalsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ModalsModule,
      providers: [
        // ModalsHelperService
      ]
    };
  }
}

export { ModalsHelperService } from './modals-helper.service';

