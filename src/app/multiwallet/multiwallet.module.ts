import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MultiwalletSidebarComponent } from './multiwallet-sidebar.component';
import { MaterialModule } from 'app/core-ui/material/material.module';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule
  ],
  exports: [
    MultiwalletSidebarComponent
  ],
  declarations: [MultiwalletSidebarComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MultiwalletModule { }
