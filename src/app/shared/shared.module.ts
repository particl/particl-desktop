import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { BsDropdownModule, CollapseModule, ModalModule, ModalDirective, PaginationModule, TooltipModule } from 'ngx-bootstrap';
import { ClipboardModule } from 'ngx-clipboard';

import { AccordionModule } from './accordion/accordion.module';

import { HeaderComponent } from './header/header.component';
import { TableComponent } from './table/table.component';
import { GridComponent } from './grid/grid.component';
import { MdDialogModule, MdExpansionModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DeleteConfirmationModalComponent } from './delete-confirmation-modal/delete-confirmation-modal.component';

@NgModule({
  imports: [
    CommonModule,
    BsDropdownModule.forRoot(),
    CollapseModule.forRoot(),
    PaginationModule.forRoot(),
    AccordionModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    MdDialogModule,
    MdExpansionModule,
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
    BsDropdownModule,
    CollapseModule,
    PaginationModule,
    ModalModule,
    TooltipModule,
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
