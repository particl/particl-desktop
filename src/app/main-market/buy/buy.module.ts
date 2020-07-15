import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MarketSharedModule } from '../shared/shared.module';
import { BuyComponent } from './buy.component';
import { BuyCommentsComponent } from './buy-comments/buy-comments.component';
import { BuyFavouritesComponent } from './buy-favourites/buy-favourites.component';
import { BuyOrdersComponent } from './buy-orders/buy-orders.component';
import { BuyOrderListItemComponent } from './buy-orders/buy-order-list-item/buy-order-list-item.component';
import { CancelBidModalComponent } from './buy-orders/cancel-bid-modal/cancel-bid-modal.component';
import { ConfirmOrderDeliveredModalComponent } from './buy-orders/confirm-order-delivered-modal/confirm-order-delivered-modal.component';
import { PayOrderModalComponent } from './buy-orders/pay-order-modal/pay-order-modal.component';


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
    BuyFavouritesComponent,
    BuyOrdersComponent,
    BuyOrderListItemComponent,
    CancelBidModalComponent,
    ConfirmOrderDeliveredModalComponent,
    PayOrderModalComponent,
  ],
  entryComponents: [
    CancelBidModalComponent,
    PayOrderModalComponent,
    ConfirmOrderDeliveredModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BuyModule { }
