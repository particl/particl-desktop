import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MainSharedModule } from 'app/main/components/main-shared.module';

import { GovernanceBaseComponent } from './base/governance-base.component';
import { routeData } from './governance.routing';

const actualRoutes: Routes = routeData.map(rd => ({path: rd.path, loadChildren: rd.lazyModule}));
if (actualRoutes.length) {
  actualRoutes.push({path: '**', redirectTo: (routeData.find(rd => !!rd.isFallbackRoute) || routeData[0]).path })
}

const routes: Routes = [
  {
    path: '',
    component: GovernanceBaseComponent,
    children: actualRoutes
  }
];


@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    MainSharedModule,
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
