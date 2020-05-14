import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { BuyComponent } from './buy.component';
import { CheckoutProcessComponent } from './checkout-process/checkout-process.component';
import { MarketSharedModule } from '../shared/shared.module';
import { BuyOrdersPageComponent } from './buy-orders-page/buy-orders-page.component';
import { BuyOrderListItemComponent } from './buy-order-list-item/buy-order-list-item.component';
import { PlaceBidModalComponent } from './place-bid-modal/place-bid-modal.component';
import { BuyQuestionsComponent } from './buy-questions/buy-questions.component';
import { CancelBidModalComponent } from './cancel-bid-modal/cancel-bid-modal.component';
import { PayOrderModalComponent } from './pay-order-modal/pay-order-modal.component';
import { ConfirmOrderDeliveredModalComponent } from './confirm-order-delivered-modal/confirm-order-delivered-modal.component';

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
    RouterModule,
    BuyOrdersPageComponent,
    BuyOrderListItemComponent
  ],
  declarations: [
    BuyComponent,
    CheckoutProcessComponent,
    PlaceBidModalComponent,
    BuyOrdersPageComponent,
    BuyOrderListItemComponent,
    BuyQuestionsComponent,
    CancelBidModalComponent,
    PayOrderModalComponent,
    ConfirmOrderDeliveredModalComponent
  ],
  entryComponents: [
    PlaceBidModalComponent,
    CancelBidModalComponent,
    PayOrderModalComponent,
    ConfirmOrderDeliveredModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BuyModule { }
