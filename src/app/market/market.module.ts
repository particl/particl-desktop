import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ListingItemComponent } from 'app/market/listings/listing-item/listing-item.component';
import { PreviewListingComponent } from 'app/market/listings/preview-listing/preview-listing.component';

import { WalletModule } from '../wallet/wallet/wallet.module';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { ListingsComponent } from './listings/listings.component';
import { BuyComponent } from './buy/buy.component';
import { SellComponent } from './sell/sell.component';
import { AddItemComponent } from './sell/add-item/add-item.component';
import { SellerListingComponent } from './sell/seller-listing/seller-listing.component';
import { FavoriteComponent } from './shared/favorite/favorite.component';
import { ReportComponent } from './shared/report/report.component';
import { OrdersComponent } from './shared/orders/orders.component';
import { CheckoutProcessComponent } from './buy/checkout-process/checkout-process.component';
import { OrderItemComponent } from './shared/orders/order-item/order-item.component';
import { AddToCartComponent } from './shared/addtocart/add-to-cart.component';
import { ShippingAddressComponent } from './shared/shipping-address/shipping-address.component';
import { market_routing } from './market.routing';

@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    WalletModule,
    market_routing
  ],
  declarations: [
    ListingItemComponent,
    PreviewListingComponent,
    ListingsComponent,
    BuyComponent,
    SellComponent,
    AddItemComponent,
    SellerListingComponent,
    FavoriteComponent,
    OrdersComponent,
    CheckoutProcessComponent,
    OrderItemComponent,
    AddToCartComponent,
    ShippingAddressComponent,
    ReportComponent
  ],
  entryComponents: [
    PreviewListingComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MarketModule { }

export { ListingItemComponent } from 'app/market/listings/listing-item/listing-item.component';
export { PreviewListingComponent } from 'app/market/listings/preview-listing/preview-listing.component';
