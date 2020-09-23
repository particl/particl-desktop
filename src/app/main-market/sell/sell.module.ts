import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MarketSharedModule } from '../shared/shared.module';

import { SellService } from './sell.service';

import { SellComponent } from './sell.component';

import { SellTemplatesComponent } from './sell-templates/sell-templates.component';
import { SellListingsComponent } from './sell-listings/sell-listings.component';
import { NewListingComponent } from './new-listing/new-listing.component';
import { ImportListingsComponent } from './import-listings/import-listings.component';
import { SellTemplateFormComponent } from './sell-template-form/sell-template-form.component';
import { PublishTemplateModalComponent } from './modals/publish-template-modal/publish-template-modal.component';
import { DeleteTemplateModalComponent } from './modals/delete-template-modal/delete-template-modal.component';
import { BatchPublishModalComponent } from './modals/batch-publish-modal/batch-publish-modal.component';
import { CloneTemplateModalComponent } from './modals/clone-template-modal/clone-template-modal.component';

import { SellOrdersComponent } from './sell-orders/sell-orders.component';
import { AcceptBidModalComponent } from './modals/accept-bid-modal/accept-bid-modal.component';
import { RejectBidModalComponent } from './modals/reject-bid-modal/reject-bid-modal.component';
import { EscrowPaymentModalComponent } from './modals/escrow-payment-modal/escrow-payment-modal.component';
import { OrderShippedModalComponent } from './modals/order-shipped-modal/order-shipped-modal.component';
import { CancelBidModalComponent } from './modals/cancel-bid-modal/cancel-bid-modal.component';

import { SellQuestionsComponent } from './sell-questions/sell-questions.component';


const routes: Routes = [
  { path: '', component: SellComponent, data: { title: 'Seller\'s Admin'} },
  { path: 'new-listing', component: NewListingComponent, data: { title: 'New Listing'} },
  { path: 'import-listings', component: ImportListingsComponent, data: { title: 'Import Listings'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule,
    MarketSharedModule,
  ],
  exports: [
    RouterModule,
  ],
  declarations: [
    SellComponent,

    SellTemplatesComponent,
    SellTemplateFormComponent,
    NewListingComponent,
    ImportListingsComponent,
    PublishTemplateModalComponent,
    DeleteTemplateModalComponent,
    CloneTemplateModalComponent,
    BatchPublishModalComponent,

    SellOrdersComponent,
    AcceptBidModalComponent,
    RejectBidModalComponent,
    CancelBidModalComponent,
    EscrowPaymentModalComponent,
    OrderShippedModalComponent,

    SellListingsComponent,

    SellQuestionsComponent,
  ],
  entryComponents: [
    PublishTemplateModalComponent,
    DeleteTemplateModalComponent,
    CloneTemplateModalComponent,
    BatchPublishModalComponent,

    AcceptBidModalComponent,
    RejectBidModalComponent,
    CancelBidModalComponent,
    EscrowPaymentModalComponent,
    OrderShippedModalComponent,
  ],
  providers: [
    SellService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SellModule { }
