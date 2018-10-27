import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from './material/material.module';
import { MainViewModule } from './main/main-view.module';
// TODO: move to material
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NvD3Module } from 'ng2-nvd3';
// d3 and nvd3 required dependecies of 'ng2-nvd3' module.
import 'd3';
import 'nvd3';

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
    MainViewModule,
    MatDialogModule, // todo move
    InfiniteScrollModule,
    NvD3Module
  ],
  exports: [
    MaterialModule,
    MainViewModule,
    PaginatorComponent,
    InfiniteScrollModule,
    NvD3Module
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
