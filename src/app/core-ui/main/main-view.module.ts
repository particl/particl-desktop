import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
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
    MaterialModule,
    ModalsModule,
    RouterTestingModule,
    CoreModule.forRoot()
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
