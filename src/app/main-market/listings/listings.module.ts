import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MarketSharedModule } from '../shared/shared.module';
import { ListingsComponent } from './listings.component';
import { ListingsService } from './listings.service';



const routes: Routes = [
  { path: '', component: ListingsComponent, data: { title: 'Browse Listings'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule,
    MarketSharedModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    ListingsComponent
  ],
  providers: [ListingsService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ListingsModule { }
