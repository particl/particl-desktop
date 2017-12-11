import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from './material/material.module';
import { MainViewModule } from './main/main-view.module';

import { MatDialogModule, MatDialogRef } from '@angular/material';
import { MatDialog } from '@angular/material'; // TODO: move to material

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MaterialModule,
    MainViewModule,
    MatDialogModule // todo move
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
        MatDialog
      ]
    };
  }
}

export { MaterialModule } from './material/material.module';
export { MainViewModule } from './main/main-view.module';
