import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegionListService } from './region-list/region-list.service';
import { TreeSelectComponent } from './tree-select/tree-select.component';
import { CoreUiModule } from 'app/core-ui/core-ui.module';


@NgModule({
  imports: [
    CommonModule,
    CoreUiModule
  ],
  declarations: [
    TreeSelectComponent
  ],
  exports: [
    TreeSelectComponent
  ],
  entryComponents: [
  ],
  providers: [
    RegionListService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MarketSharedModule { }


export { RegionListService } from './region-list/region-list.service';
export { TreeSelectComponent } from './tree-select/tree-select.component';
