import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { ClipboardModule } from 'ngx-clipboard';

import { MaterialModule } from '../../core-ui/material/material.module';
import { HeaderComponent } from './header/header.component';
import {
  DeleteConfirmationModalComponent
} from './delete-confirmation-modal/delete-confirmation-modal.component';
import { ProcessingModalComponent } from 'app/modals/processing-modal/processing-modal.component';

@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    HttpClientModule
  ],
  declarations: [
    HeaderComponent,
    DeleteConfirmationModalComponent,
    ProcessingModalComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ClipboardModule,
    HeaderComponent,

    HttpClientModule
  ],
  entryComponents: [
    DeleteConfirmationModalComponent,
    ProcessingModalComponent
  ],
})
export class SharedModule { }
