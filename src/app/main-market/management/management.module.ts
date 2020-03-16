import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { ManagementComponent } from './management.component';


const routes: Routes = [
  { path: '', component: ManagementComponent, data: { title: 'Manage Markets'} }
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
    ManagementComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ManagementModule { }
