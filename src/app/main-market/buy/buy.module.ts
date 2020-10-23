import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MarketSharedModule } from '../shared/shared.module';
import { BuyComponent } from './buy.component';
import { BuyCommentsComponent } from './buy-comments/buy-comments.component';
import { BuyOrdersComponent } from './buy-orders/buy-orders.component';
import { CancelBidModalComponent } from './buy-orders/cancel-bid-modal/cancel-bid-modal.component';
import { ConfirmOrderDeliveredModalComponent } from './buy-orders/confirm-order-delivered-modal/confirm-order-delivered-modal.component';
import { PayOrderModalComponent } from './buy-orders/pay-order-modal/pay-order-modal.component';
import { BuyShippingProfilesComponent } from './buy-shipping-profiles/buy-shipping-profiles.component';
import { EditShippingProfileModalComponent } from './buy-shipping-profiles/edit-shipping-profile-modal/edit-shipping-profile-modal.component';


const routes: Routes = [
  { path: '', component: BuyComponent, data: { title: 'Purchases'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule,
    MarketSharedModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    BuyComponent,
    BuyCommentsComponent,
    BuyOrdersComponent,
    CancelBidModalComponent,
    ConfirmOrderDeliveredModalComponent,
    PayOrderModalComponent,
    BuyShippingProfilesComponent,
    EditShippingProfileModalComponent,
  ],
  entryComponents: [
    CancelBidModalComponent,
    PayOrderModalComponent,
    ConfirmOrderDeliveredModalComponent,
    EditShippingProfileModalComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BuyModule { }