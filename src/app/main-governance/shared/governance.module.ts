import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { StatusBarComponent } from './status-bar/status-bar.component';


@NgModule({
  imports: [
    CommonModule,
    CoreUiModule
  ],
  exports: [
    StatusBarComponent
  ],
  declarations: [
    StatusBarComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GovernanceSharedModule { }
