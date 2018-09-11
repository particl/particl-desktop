import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from './material/material.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NvD3Module } from 'ng2-nvd3';
// d3 and nvd3 required dependecies of 'ng2-nvd3' module.
import 'd3';
import 'nvd3';

import { MatDialogModule } from '@angular/material';
import { MatDialog } from '@angular/material';
import { PaginatorComponent } from './paginator/paginator.component';

import { DirectiveModule } from './directive/directive.module';

@NgModule({
  declarations: [
    PaginatorComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    MatDialogModule, // todo move
    InfiniteScrollModule,
    DirectiveModule,
    NvD3Module
  ],
  exports: [
    MaterialModule,
    PaginatorComponent,
    InfiniteScrollModule,
    NvD3Module,
    DirectiveModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CoreUiModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreUiModule,
      providers: [
        MatDialog // TODO; move to material module
      ]
    };
  }
}

export { MaterialModule } from './material/material.module';

