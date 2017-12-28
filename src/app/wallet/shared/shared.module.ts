import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { ClipboardModule } from 'ngx-clipboard';

import { MaterialModule } from '../../core-ui/material/material.module';
import { HeaderComponent } from './header/header.component';
import { TableComponent } from './table/table.component';
import {
  DeleteConfirmationModalComponent
} from './delete-confirmation-modal/delete-confirmation-modal.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    HttpClientModule
  ],
  declarations: [
    HeaderComponent,
    TableComponent,
    DeleteConfirmationModalComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ClipboardModule,
    HeaderComponent,
    TableComponent
  ],
  entryComponents: [
    DeleteConfirmationModalComponent
  ],
})
export class SharedModule { }
