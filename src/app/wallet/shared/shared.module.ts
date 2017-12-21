import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  MatButtonModule,
  MatDialogModule,
  MatExpansionModule,
  MatIconModule,
  MatInputModule
} from '@angular/material';

import { ClipboardModule } from 'ngx-clipboard';

import { AccordionModule } from './accordion/accordion.module';
import { HeaderComponent } from './header/header.component';
import { TableComponent } from './table/table.component';
import { GridComponent } from './grid/grid.component';
import { DeleteConfirmationModalComponent } from './delete-confirmation-modal/delete-confirmation-modal.component';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    AccordionModule
  ],
  declarations: [
    HeaderComponent,
    TableComponent,
    GridComponent,
    DeleteConfirmationModalComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    HttpClient,
    ClipboardModule,
    AccordionModule,
    HeaderComponent,
    TableComponent,
    GridComponent
  ],
  entryComponents: [
    DeleteConfirmationModalComponent
  ],
})
export class SharedModule { }
