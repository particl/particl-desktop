import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GalleryModule } from '@ngx-gallery/core';
import { LightboxModule } from '@ngx-gallery/lightbox';
import { GallerizeModule } from '@ngx-gallery/gallerize';
import 'hammerjs';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { TreeSelectComponent } from './tree-select/tree-select.component';
import { ListingItemCommentsComponent } from './listingitem-comments/listingitem-comments.component';
import { ListingDetailModalComponent } from './listing-detail-modal/listing-detail-modal.component';
import { ShippingProfileAddressFormComponent } from './shipping-profile-address-form/shipping-profile-address-form.component';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { ChatMessageModalComponent } from './chat-message-modal/chat-message-modal.component';

@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    GalleryModule,
    LightboxModule,
    GallerizeModule,
    InfiniteScrollModule
  ],
  declarations: [
    TreeSelectComponent,
    ListingItemCommentsComponent,
    ListingDetailModalComponent,
    ShippingProfileAddressFormComponent,
    ChatMessageComponent,
    ChatMessageModalComponent,
  ],
  exports: [
    TreeSelectComponent,
    ListingItemCommentsComponent,
    ListingDetailModalComponent,
    ShippingProfileAddressFormComponent,
    ChatMessageComponent,
    ChatMessageModalComponent,
    GalleryModule,
    LightboxModule,
    GallerizeModule,
    InfiniteScrollModule
  ],
  entryComponents: [
    ListingDetailModalComponent,
    ChatMessageModalComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MarketSharedModule { }

export { TreeSelectComponent } from './tree-select/tree-select.component';
