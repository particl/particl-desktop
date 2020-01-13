import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainRoutingModule } from 'app/main/main-routing.module';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { BaseComponent } from './base/base.component';
import { MultiwalletSidebarComponent } from './components/multiwallet/multiwallet-sidebar.component';

@NgModule({
  declarations: [
    BaseComponent,
    MultiwalletSidebarComponent
  ],
  imports: [
    CommonModule,
    CoreUiModule,
    MainRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MainModule {
  constructor() {
  }
}
