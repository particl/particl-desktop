import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutSideNavComponent } from './side-nav/side-nav.component';
import { MdDialogModule, MdExpansionModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ModalsService } from '../modals/modals.service';

@NgModule({
  imports: [
    CommonModule,
    MdDialogModule,
    FlexLayoutModule,
    MdExpansionModule,
  ],
  declarations: [LayoutSideNavComponent],
  exports: [
    LayoutSideNavComponent
  ],
  providers: [
    ModalsService
  ]
})
export class LayoutsModule {
}
