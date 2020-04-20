import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { NewExchangeComponent } from './new-exchange.component';


const routes: Routes = [
  { path: '', component: NewExchangeComponent, data: { title: 'New Exchange'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    NewExchangeComponent
  ],
  entryComponents: [
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NewExchangeModule { }
