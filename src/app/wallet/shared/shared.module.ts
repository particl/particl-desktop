import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { ClipboardModule } from 'ngx-clipboard';

import { AccordionModule } from './accordion/accordion.module';

import { HeaderComponent } from './header/header.component';
import { TableComponent } from './table/table.component';
import { GridComponent } from './grid/grid.component';
import { MdButtonModule, MdDialogModule, MdExpansionModule, MdIconModule, MdInputModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DeleteConfirmationModalComponent } from './delete-confirmation-modal/delete-confirmation-modal.component';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  imports: [
    CommonModule,
    AccordionModule,
    MdDialogModule,
    MdExpansionModule,
    MdInputModule,
    MdIconModule,
    // BrowserAnimationsModule,
    MdButtonModule,
    FlexLayoutModule
  ],
  declarations: [
    HeaderComponent,
    TableComponent,
    GridComponent,
    DeleteConfirmationModalComponent
  ],
  exports: [
    CommonModule,
    HttpModule,
    FormsModule,
    ClipboardModule,
    HeaderComponent,
    TableComponent,
    GridComponent,
    AccordionModule
  ],
  entryComponents: [
    DeleteConfirmationModalComponent
  ],
})
export class SharedModule { }
