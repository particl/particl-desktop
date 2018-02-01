import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewListingsComponent } from './overview-listings/overview-listings.component';
import { PreviewListingComponent } from './overview-listings/preview-listing/preview-listing.component';

import { routing } from './market.routing';

@NgModule({
  imports: [
    CommonModule,
    routing
  ],
  declarations: [
    OverviewListingsComponent, 
    PreviewListingComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MarketModule { }

export { OverviewListingsComponent } from './overview-listings/overview-listings.component';
export { PreviewListingComponent } from './overview-listings/preview-listing/preview-listing.component';