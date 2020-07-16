import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MarketSharedModule } from '../shared/shared.module';

import { BuyCheckoutComponent } from './buy-checkout.component';
import { BuyFavouritesComponent } from './buy-favourites/buy-favourites.component';
import { PlaceBidModalComponent } from './place-bid-modal/place-bid-modal.component';


const routes: Routes = [
  { path: '', component: BuyCheckoutComponent, data: { title: 'Your Cart'} }
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
    BuyCheckoutComponent,
    BuyFavouritesComponent,
    PlaceBidModalComponent,
  ],
  entryComponents: [
    PlaceBidModalComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BuyCheckoutModule { }
