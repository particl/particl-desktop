import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MaterialFileInputModule } from 'ngx-material-file-input';
import { MaterialModule } from 'app/core-ui/material/material.module';
import { DirectiveModule } from 'app/core-ui/directive/directive.module';
import { ImportListingsComponent } from './import-listings.component';
import { ImportListingComponent } from './import-listing/import-listing.component';
import { ImportCustomUiCsvComponent } from './import-custom-ui/csv/csv.component';
import { ImportCustomUiWoocommerceComponent } from './import-custom-ui/woocommerce/woocommerce.component';
import { ImportCustomUiEbayComponent } from './import-custom-ui/ebay-scraper/ebay-scraper.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    MaterialFileInputModule,
    DirectiveModule,
  ],
  declarations: [
    ImportListingsComponent,
    ImportListingComponent,
    ImportCustomUiCsvComponent,
    ImportCustomUiWoocommerceComponent,
    ImportCustomUiEbayComponent
  ],
  entryComponents: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ImportListingsModule {}
