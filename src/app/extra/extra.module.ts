import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { ExtraRoutingModule } from './extra-routing.module';

@NgModule({
  imports: [
    CommonModule,
    ExtraRoutingModule,
    CoreUiModule
  ],
  declarations: [
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExtraModule { }
