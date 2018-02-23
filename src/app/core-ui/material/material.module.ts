import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatButtonModule, MatCardModule, MatCheckboxModule, MatExpansionModule, MatGridListModule, MatIconModule,
  MatListModule,
  MatMenuModule,
  MatProgressBarModule,
  MatSidenavModule,
  MatSnackBarModule, MatTabsModule, MatToolbarModule, MatRadioModule, MatInputModule,
  MatTooltipModule,
  MatSelectModule, MatPaginatorModule, MatProgressSpinnerModule, MatDialogModule,
  MatStepperModule, MatSlideToggleModule
} from '@angular/material';

import {A11yModule} from '@angular/cdk/a11y';

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
    MatSidenavModule,
    MatGridListModule,
    MatCardModule,
    MatToolbarModule,
    MatRadioModule,
    MatSelectModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatSlideToggleModule
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
    MatSidenavModule,
    MatGridListModule,
    MatCardModule,
    MatToolbarModule,
    MatRadioModule,
    MatSelectModule,
    MatInputModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatStepperModule,
    MatSlideToggleModule
  ],
  declarations: []
})
export class MaterialModule { }
