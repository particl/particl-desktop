import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeSelectComponent } from './tree-select/tree-select.component';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { QuestionThreadListItemComponent } from './question-thread-list-item/question-thread-list-item.component';
import { ListingListItemComponent } from './listing-list-item/listing-list-item.component';
import { ListingDetailModalComponent } from './listing-detail-modal/listing-detail-modal.component';

@NgModule({
  imports: [
    CommonModule,
    CoreUiModule
  ],
  declarations: [
    TreeSelectComponent,
    QuestionThreadListItemComponent,
    ListingListItemComponent,
    ListingDetailModalComponent
  ],
  exports: [
    TreeSelectComponent,
    QuestionThreadListItemComponent,
    ListingListItemComponent,
    ListingDetailModalComponent
  ],
  entryComponents: [
    ListingDetailModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MarketSharedModule { }

export { TreeSelectComponent } from './tree-select/tree-select.component';
