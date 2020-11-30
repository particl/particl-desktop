import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StartupRoutingModule } from './startup-routing.module';
import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { LoadingComponent } from 'app/startup/loading/loading.component';
import { TermsComponent } from 'app/startup/terms/terms.component';

@NgModule({
  imports: [
    CommonModule,
    StartupRoutingModule,
    CoreUiModule
  ],
  declarations: [
    LoadingComponent,
    TermsComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class StartupModule { }
