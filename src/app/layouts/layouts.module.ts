import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutSideNavComponent } from './side-nav/side-nav.component';
import { MdDialog, MdDialogRef} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ModalsService } from '../modals/modals.service';

@NgModule({
  imports: [
    CommonModule,
    MdDialog,
    MdDialogRef,
    FlexLayoutModule
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
