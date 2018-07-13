import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from './material/material.module';
import { MainViewModule } from './main/main-view.module';

import { MatDialogModule } from '@angular/material';
import { MatDialog } from '@angular/material';
import { PaginatorComponent } from './paginator/paginator.component';
// TODO: move to material
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { DirectiveModule } from './directive/directive.module';

@NgModule({
  declarations: [
    PaginatorComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    MainViewModule,
    MatDialogModule, // todo move
    InfiniteScrollModule,
    DirectiveModule
  ],
  exports: [
    MaterialModule,
    MainViewModule,
    PaginatorComponent,
    InfiniteScrollModule,
    DirectiveModule
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
// export { CoreUi } from './main/main-view.module';
