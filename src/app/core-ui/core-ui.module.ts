import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';


/* The core router is the whole application. */
import { CoreRouterModule } from './core-router/core-router.module';
import { DirectivesModule } from './directives/directives.module';
import { MaterialModule } from './material/material.module';

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
    DirectivesModule,
    MaterialModule,
    MatDialogModule, // todo move
  ],
  exports: [
    CoreRouterModule,
    DirectivesModule,
    MaterialModule,
    PaginatorComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
