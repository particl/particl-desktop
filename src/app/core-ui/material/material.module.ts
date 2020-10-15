import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatButtonModule, MatCardModule, MatCheckboxModule, MatExpansionModule, MatGridListModule, MatIconModule, MatBadgeModule, MatSliderModule,
  MatListModule,
  MatMenuModule,
  MatProgressBarModule,
  MatSidenavModule,
  MatSnackBarModule, MatTabsModule, MatToolbarModule, MatRadioModule, MatInputModule,
  MatTooltipModule,
  MatSelectModule, MatPaginatorModule, MatProgressSpinnerModule, MatDialogModule,
  MatStepperModule, MatSlideToggleModule, MatAutocompleteModule, MatButtonToggleModule,
  MatTableModule, MatTreeModule, MatSortModule
} from '@angular/material';

import { A11yModule } from '@angular/cdk/a11y';
import { PortalModule } from '@angular/cdk/portal';
import { OverlayModule } from '@angular/cdk/overlay';
import { CdkTreeModule } from '@angular/cdk/tree';

import { FlexLayoutModule } from '@angular/flex-layout';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/* A unified module that will simply manage all our Material imports (and export them again) */

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule, /* Flex layout here too */
    FormsModule, /* forms */
    ReactiveFormsModule, /* forms */
    A11yModule, /* focus monitor */
    MatButtonModule,
    MatCheckboxModule,
    MatListModule,
    MatExpansionModule,
    MatTooltipModule,
    MatTabsModule,
    MatSnackBarModule,
    MatMenuModule,
    MatProgressBarModule,
    MatIconModule,
    MatBadgeModule,
    MatSliderModule,
    MatSidenavModule,
    MatGridListModule,
    MatCardModule,
    MatToolbarModule,
    MatRadioModule,
    MatSelectModule,
    MatSortModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatTableModule,
    MatTreeModule,
    CdkTreeModule,
    OverlayModule,
    PortalModule
  ],
  exports: [
    FlexLayoutModule, /* Flex layout here too */
    FormsModule, /* forms */
    ReactiveFormsModule, /* forms */
    A11yModule, /* focus monitor */
    MatButtonModule,
    MatCheckboxModule,
    MatListModule,
    MatExpansionModule,
    MatTooltipModule,
    MatTabsModule,
    MatSnackBarModule,
    MatMenuModule,
    MatProgressBarModule,
    MatIconModule,
    MatBadgeModule,
    MatSliderModule,
    MatSidenavModule,
    MatGridListModule,
    MatCardModule,
    MatToolbarModule,
    MatRadioModule,
    MatSelectModule,
    MatSortModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatStepperModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatTreeModule,
    CdkTreeModule,
    PortalModule,
    OverlayModule
  ],
  declarations: [
  ]
})
export class MaterialModule { }
