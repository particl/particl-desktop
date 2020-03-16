import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { SellComponent } from './sell.component';


const routes: Routes = [
  { path: '', component: SellComponent, data: { title: 'Overview'} }
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
    SellComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SellModule { }
