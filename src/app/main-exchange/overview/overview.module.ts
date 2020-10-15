import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { ExchangeOverviewComponent } from './overview.component';


const routes: Routes = [
  { path: '', component: ExchangeOverviewComponent, data: { title: 'Overview'} }
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
    ExchangeOverviewComponent
  ],
  entryComponents: [
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExchangeOverviewModule { }
