import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GalleryModule } from '@ngx-gallery/core';
import { LightboxModule } from '@ngx-gallery/lightbox';
import { GallerizeModule } from '@ngx-gallery/gallerize';
import 'hammerjs';

import { TreeSelectComponent } from './tree-select/tree-select.component';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { QuestionThreadListItemComponent } from './question-thread-list-item/question-thread-list-item.component';
import { ListingDetailModalComponent } from './listing-detail-modal/listing-detail-modal.component';

@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    GalleryModule,
    LightboxModule,
    GallerizeModule,
  ],
  declarations: [
    TreeSelectComponent,
    QuestionThreadListItemComponent,
    ListingDetailModalComponent
  ],
  exports: [
    TreeSelectComponent,
    QuestionThreadListItemComponent,
    ListingDetailModalComponent,
    GalleryModule,
    LightboxModule,
    GallerizeModule,
  ],
  entryComponents: [
    ListingDetailModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MarketSharedModule { }

export { TreeSelectComponent } from './tree-select/tree-select.component';
