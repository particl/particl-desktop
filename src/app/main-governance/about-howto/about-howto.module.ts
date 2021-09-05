import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { GovernanceSharedModule } from '../shared/shared.module';
import { AboutHowtoComponent } from './about-howto.component';


const routes: Routes = [
  { path: '', component: AboutHowtoComponent, data: { title: 'About Proposals'} }
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
    AboutHowtoComponent,
  ],
  entryComponents: [
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AboutHowtoModule { }
