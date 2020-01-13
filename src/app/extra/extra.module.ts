import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { ExtraRoutingModule } from './extra-routing.module';
import { HelpComponent } from 'app/extra/help/help.component';
import { ExtraBaseComponent } from './base/extra-base.component';

@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    ExtraRoutingModule
  ],
  declarations: [
    HelpComponent,
    ExtraBaseComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExtraModule { }
