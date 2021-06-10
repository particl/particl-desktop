import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { GovernanceSharedModule } from '../shared/governance.module';
import { CurrentComponent } from './current.component';


const routes: Routes = [
  { path: '', component: CurrentComponent, data: { title: 'Active Proposals'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule,
    GovernanceSharedModule,
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    CurrentComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CurrentModule { }
