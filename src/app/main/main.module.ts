import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { MainRoutingModule } from 'app/main/main-routing.module';

@NgModule({
  declarations: [
  ],
  imports: [
    MainRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
  constructor() {
  }
}
