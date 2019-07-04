import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from './material/material.module';

import { MatDialogModule } from '@angular/material';
import { MatDialog } from '@angular/material';
import { PaginatorComponent } from './paginator/paginator.component';

@NgModule({
  declarations: [
    PaginatorComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    MatDialogModule // todo move
  ],
  exports: [
    MaterialModule,
    PaginatorComponent
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
