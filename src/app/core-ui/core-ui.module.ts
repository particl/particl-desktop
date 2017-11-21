import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from './material/material.module';
import { MainViewModule } from './main/main-view.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MaterialModule,
    MainViewModule
  ],
  exports: [
    MaterialModule,
    MainViewModule
  ]
})
export class CoreUiModule { }

export { MaterialModule } from './material/material.module';
export { MainViewModule } from './main/main-view.module';
