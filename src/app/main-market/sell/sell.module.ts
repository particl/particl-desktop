import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MarketSharedModule } from '../shared/shared.module';
import { SellComponent } from './sell.component';
import { NewListingComponent } from './new-listing/new-listing.component';
import { ImportListingsComponent } from './import-listings/import-listings.component';
import { SellService } from './sell.service';
import { PublishTemplateModalComponent } from './new-listing/publish-template-modal/publish-template-modal.component';


const routes: Routes = [
  { path: '', component: SellComponent, data: { title: 'Seller\'s Admin'} },
  { path: 'new-listing', component: NewListingComponent, data: { title: 'New Listing'} },
  { path: 'import-listings', component: ImportListingsComponent, data: { title: 'Import Listings'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule,
    MarketSharedModule,
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    SellComponent,
    NewListingComponent,
    ImportListingsComponent,
    PublishTemplateModalComponent
  ],
  entryComponents: [
    PublishTemplateModalComponent
  ],
  providers: [
    SellService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SellModule { }
