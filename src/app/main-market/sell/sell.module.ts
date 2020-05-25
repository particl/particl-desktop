import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MarketSharedModule } from '../shared/shared.module';

import { SellService } from './sell.service';

import { SellComponent } from './sell.component';

import { SellTemplatesComponent } from './sell-templates/sell-templates.component';
import { NewListingComponent } from './new-listing/new-listing.component';
import { ImportListingsComponent } from './import-listings/import-listings.component';
import { SellTemplateFormComponent } from './sell-template-form/sell-template-form.component';
import { PublishTemplateModalComponent } from './new-listing/publish-template-modal/publish-template-modal.component';

import { SellOrdersComponent } from './sell-orders/sell-orders.component';
import { SellOrderListItemComponent } from './sell-order-list-item/sell-order-list-item.component';
import { AcceptBidModalComponent } from './accept-bid-modal/accept-bid-modal.component';
import { RejectBidModalComponent } from './reject-bid-modal/reject-bid-modal.component';
import { EscrowPaymentModalComponent } from './escrow-payment-modal/escrow-payment-modal.component';
import { OrderShippedModalComponent } from './order-shipped-modal/order-shipped-modal.component';

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
    SellOrdersComponent,
    SellOrderListItemComponent,
    AcceptBidModalComponent,
    RejectBidModalComponent,
    EscrowPaymentModalComponent,
    OrderShippedModalComponent,
    SellQuestionsComponent,
  ],
  entryComponents: [
    PublishTemplateModalComponent,
    AcceptBidModalComponent,
    RejectBidModalComponent,
    EscrowPaymentModalComponent,
    OrderShippedModalComponent
  ],
  providers: [
    SellService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SellModule { }
