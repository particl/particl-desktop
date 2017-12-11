import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MaterialModule } from '../material/material.module';
import { ModalsModule } from '../../modals/modals.module';
import { CoreModule } from '../../core/core.module';

import { MainViewComponent } from './main-view.component';
import { StatusComponent } from './status/status.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule
  ],
  exports: [
    MainViewComponent,
  ],
  declarations: [
    MainViewComponent,
    StatusComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MainViewModule { }
