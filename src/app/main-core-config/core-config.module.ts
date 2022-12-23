import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MainSharedModule } from 'app/main/components/main-shared.module';

import { CoreConfigurationService } from './core-config.service';

import { CoreConfigComponent } from './core-config.component';
import { childRoutes } from './core-config.routes';


const routes: Routes = [
  {
    path: '',
    component: CoreConfigComponent,
    children: childRoutes,
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
    CoreConfigComponent
  ],
  providers: [
    CoreConfigurationService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CoreConfigModule { }
