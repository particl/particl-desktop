import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  MatButtonModule, MatCardModule, MatCheckboxModule, MatExpansionModule, MatGridListModule, MatIconModule, MatSliderModule,
  MatListModule,
  MatMenuModule,
  MatProgressBarModule,
  MatSidenavModule,
  MatSnackBarModule, MatTabsModule, MatToolbarModule, MatRadioModule, MatInputModule,
  MatTooltipModule,
  MatSelectModule, MatPaginatorModule, MatProgressSpinnerModule, MatDialogModule,
  MatStepperModule, MatSlideToggleModule, MatAutocompleteModule, MatButtonToggleModule
} from '@angular/material';


import {A11yModule} from '@angular/cdk/a11y';

import { FlexLayoutModule } from '@angular/flex-layout';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectSearchComponent } from './mat-select-search/mat-select-search.component';
import { MatOtpGroupSelectSearchComponent } from './mat-otpgroup-select-search/mat-otpgroup-select-search.component';

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
    MatSliderModule,
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
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatButtonToggleModule
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
    MatSliderModule,
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
    MatSlideToggleModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    MatSelectSearchComponent,
    MatOtpGroupSelectSearchComponent
  ],
  declarations: [
    MatSelectSearchComponent,
    MatOtpGroupSelectSearchComponent
  ]
})
export class MaterialModule { }
