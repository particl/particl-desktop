import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from './material/material.module';

/* The core router is the whole application. */
import { CoreRouterModule } from './core-router/core-router.module';

// TODO: move to material
import { MatDialogModule } from '@angular/material';
import { MatDialog } from '@angular/material';
import { PaginatorComponent } from './paginator/paginator.component';


@NgModule({
  declarations: [
    PaginatorComponent,
  ],
  imports: [
    CommonModule,
    CoreRouterModule,
    MaterialModule,
    MatDialogModule // todo move
  ],
  exports: [
    CoreRouterModule,
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
export { CoreRouterModule } from './core-router/core-router.module';
