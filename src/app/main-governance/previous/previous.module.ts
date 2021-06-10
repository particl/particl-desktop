import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { GovernanceSharedModule } from '../shared/governance.module';
import { PreviousComponent } from './previous.component';


const routes: Routes = [
  { path: '', component: PreviousComponent, data: { title: 'Past Proposals and Results'} }
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
    PreviousComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PreviousModule { }
