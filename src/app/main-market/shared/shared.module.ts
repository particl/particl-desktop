import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GalleryModule } from '@ngx-gallery/core';
import { LightboxModule } from '@ngx-gallery/lightbox';
import { GallerizeModule } from '@ngx-gallery/gallerize';
import 'hammerjs';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { TreeSelectComponent } from './tree-select/tree-select.component';
import { QuestionThreadListItemComponent } from './question-thread-list-item/question-thread-list-item.component';
import { ListingDetailModalComponent } from './listing-detail-modal/listing-detail-modal.component';
import { ShippingProfileAddressFormComponent } from './shipping-profile-address-form/shipping-profile-address-form.component';

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
    QuestionThreadListItemComponent,
    ListingDetailModalComponent,
    ShippingProfileAddressFormComponent
  ],
  exports: [
    TreeSelectComponent,
    QuestionThreadListItemComponent,
    ListingDetailModalComponent,
    ShippingProfileAddressFormComponent,
    GalleryModule,
    LightboxModule,
    GallerizeModule,
    InfiniteScrollModule
  ],
  entryComponents: [
    ListingDetailModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MarketSharedModule { }

export { TreeSelectComponent } from './tree-select/tree-select.component';
