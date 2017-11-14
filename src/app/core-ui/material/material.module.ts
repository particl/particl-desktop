import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MdButtonModule, MdCardModule, MdCheckboxModule, MdExpansionModule, MdGridListModule, MdIconModule, MdListModule,
  MdMenuModule,
  MdProgressBarModule,
  MdSidenavModule,
  MdSnackBarModule, MdTabsModule, MdToolbarModule,
  MdTooltipModule
} from '@angular/material';

import { FlexLayoutModule } from '@angular/flex-layout';

/* A unified module that will simply manage all our Material imports (and export them again) */

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule, /* Flex layout here too */
    MdButtonModule,
    MdCheckboxModule,
    MdListModule,
    MdExpansionModule,
    MdTooltipModule,
    MdSnackBarModule,
    MdMenuModule,
    MdProgressBarModule,
    MdIconModule,
    MdSidenavModule,
    MdGridListModule,
    MdCardModule,
    MdToolbarModule
  ], 
  exports: [
    CommonModule,
    FlexLayoutModule, /* Flex layout here too */
    MdButtonModule,
    MdCheckboxModule,
    MdListModule,
    MdExpansionModule,
    MdTooltipModule,
    MdSnackBarModule,
    MdMenuModule,
    MdProgressBarModule,
    MdIconModule,
    MdSidenavModule,
    MdGridListModule,
    MdCardModule,
    MdToolbarModule
  ],
  declarations: []
})
export class MaterialModule { }