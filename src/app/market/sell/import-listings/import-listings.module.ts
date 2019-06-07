import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { MaterialFileInputModule } from 'ngx-material-file-input';
import { MaterialModule } from 'app/core-ui/material/material.module';
import { DirectiveModule } from 'app/core-ui/directive/directive.module';
import { ImportListingsComponent } from './import-listings.component';
import { ImportListingComponent } from './import-listing/import-listing.component';

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
    ImportListingComponent
  ],
  entryComponents: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ImportListingsModule {}
