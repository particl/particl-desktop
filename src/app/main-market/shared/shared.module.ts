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
import { ChatConversationComponent } from './chat-conversation/chat-conversation.component';
import { ChatConversationModalComponent } from './chat-conversation-modal/chat-conversation-modal.component';

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
    ChatConversationComponent,
    ChatConversationModalComponent,
  ],
  exports: [
    TreeSelectComponent,
    ListingItemCommentsComponent,
    ListingDetailModalComponent,
    ShippingProfileAddressFormComponent,
    ChatConversationComponent,
    ChatConversationModalComponent,
    GalleryModule,
    LightboxModule,
    GallerizeModule,
    InfiniteScrollModule
  ],
  entryComponents: [
    ListingDetailModalComponent,
    ChatConversationModalComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MarketSharedModule { }

export { TreeSelectComponent } from './tree-select/tree-select.component';
