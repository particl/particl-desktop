import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgxsModule } from '@ngxs/store';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MainSharedModule } from 'app/main/components/main-shared.module';

import { GovernanceState } from './store/governance-store.state';
import { GovernanceBaseComponent } from './base/governance-base.component';


const routes: Routes = [
  {
    path: '',
    component: GovernanceBaseComponent,
    children: [
      {
        path: 'proposals',
        loadChildren: () => import('./proposals/proposals.module').then(m => m.ProposalsModule),
      },
      { path: '**', redirectTo: 'proposals' },
    ]
  }
];


@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    MainSharedModule,
    NgxsModule.forFeature(
      [GovernanceState]
    ),
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    GovernanceBaseComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GovernanceModule { }
