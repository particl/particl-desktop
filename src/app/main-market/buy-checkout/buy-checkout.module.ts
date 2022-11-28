import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MarketSharedModule } from '../shared/shared.module';

import { BuyCheckoutComponent } from './buy-checkout.component';
import { BuyFavouritesComponent } from './buy-favourites/buy-favourites.component';
import { BuyCartComponent } from './buy-cart/buy-cart.component';
import { PlaceBidModalComponent } from './buy-cart/place-bid-modal/place-bid-modal.component';
import { BuyShippingProfilesComponent } from './buy-shipping-profiles/buy-shipping-profiles.component';
import { EditShippingProfileModalComponent } from './buy-shipping-profiles/edit-shipping-profile-modal/edit-shipping-profile-modal.component';


const routes: Routes = [
  { path: '', component: BuyCheckoutComponent, data: { title: 'Cart'} }
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
    BuyCartComponent,
    BuyFavouritesComponent,
    PlaceBidModalComponent,
    BuyShippingProfilesComponent,
    EditShippingProfileModalComponent,
  ],
  entryComponents: [
    PlaceBidModalComponent,
    EditShippingProfileModalComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class BuyCheckoutModule { }
