import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { GovernanceSharedModule } from '../shared/shared.module';
import { ProposalsComponent } from './proposals.component';


const routes: Routes = [
  { path: '', component: ProposalsComponent, data: { title: 'Active Proposals'} }
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
    ProposalsComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProposalsModule { }
