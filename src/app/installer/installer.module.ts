import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstallerRouterComponent } from './installer.component';

import { installer_routing } from './installer.routing';
import { TestComponent } from './test/test.component';

@NgModule({
  imports: [
    CommonModule,
    //installer_routing
  ],
  exports: [
    InstallerRouterComponent
  ],
  declarations: [InstallerRouterComponent, TestComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InstallerModule { }
