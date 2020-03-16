import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { ListingsComponent } from './listings.component';


const routes: Routes = [
  { path: '', component: ListingsComponent, data: { title: 'Listings'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule,
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    ListingsComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ListingsModule { }
