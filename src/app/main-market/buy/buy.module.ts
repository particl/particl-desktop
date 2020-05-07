import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { BuyComponent } from './buy.component';
import { CheckoutProcessComponent } from './checkout-process/checkout-process.component';
import { PlaceOrderModalComponent } from './checkout-process/place-order-modal/place-order-modal.component';
import { MarketSharedModule } from '../shared/shared.module';
import { BuyOrdersPageComponent } from './buy-orders-page/buy-orders-page.component';
import { BuyOrderListItemComponent } from './buy-order-list-item/buy-order-list-item.component';

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
    PlaceOrderModalComponent,
    BuyOrdersPageComponent,
    BuyOrderListItemComponent
  ],
  entryComponents: [
    PlaceOrderModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BuyModule { }
