import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { ClipboardModule } from 'ngx-clipboard';
import { MaterialModule } from '../../core-ui/material/material.module';
import { AccordionModule } from './accordion/accordion.module';

import { HeaderComponent } from './header/header.component';
import { TableComponent } from './table/table.component';
import { GridComponent } from './grid/grid.component';
import { DeleteConfirmationModalComponent } from './delete-confirmation-modal/delete-confirmation-modal.component';

@NgModule({
  imports: [
    CommonModule,
    AccordionModule,
    MaterialModule
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
