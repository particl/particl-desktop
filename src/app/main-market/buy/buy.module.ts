import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { BuyComponent } from './buy.component';
import { CheckoutProcessComponent } from './checkout-process/checkout-process.component';
import { PlaceOrderModalComponent } from './checkout-process/place-order-modal/place-order-modal.component';


const routes: Routes = [
  { path: '', component: BuyComponent, data: { title: 'Purchases'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule,
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    BuyComponent,
    CheckoutProcessComponent,
    PlaceOrderModalComponent
  ],
  entryComponents: [
    PlaceOrderModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BuyModule { }
