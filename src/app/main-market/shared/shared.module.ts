import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RegionListService } from './region-list/region-list.service';


@NgModule({
  imports: [
  ],
  declarations: [
  ],
  exports: [
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
