import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { ProposalsComponent } from './proposals.component';


const routes: Routes = [
  { path: '', component: ProposalsComponent, data: { title: 'Proposals'} }
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
    ProposalsComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProposalsModule { }
