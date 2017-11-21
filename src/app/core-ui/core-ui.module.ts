import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from './material/material.module';
import { MainViewModule } from './main/main-view.module';

import { MdDialogModule, MdDialogRef } from '@angular/material';
import { MdDialog } from '@angular/material'; // TODO: move to material

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MaterialModule,
    MainViewModule,
    MdDialogModule // todo move
  ],
  exports: [
    MaterialModule,
    MainViewModule
  ]
})
export class CoreUiModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreUiModule,
      providers: [
        MdDialog
      ]
    };
  }
}

export { MaterialModule } from './material/material.module';
export { MainViewModule } from './main/main-view.module';
