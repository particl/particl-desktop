import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { ExtraBaseComponent } from './base/extra-base.component';
import { ExtraRoutingModule } from './extra-routing.module';


@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    ExtraRoutingModule
  ],
  declarations: [
    ExtraBaseComponent,
  ],
  entryComponents: [
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExtraModule { }
