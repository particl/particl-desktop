import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StartupRoutingModule } from './startup-routing.module';

import { LoadingComponent } from './loading/loading.component';

@NgModule({
  imports: [
    CommonModule,
    StartupRoutingModule
  ],
  declarations: [LoadingComponent]
})
export class StartupModule { }
