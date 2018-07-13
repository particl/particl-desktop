import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstallerComponent } from './installer.component';

import { installer_routing } from './installer.routing';

@NgModule({
  imports: [
    CommonModule,
    installer_routing
  ],
  exports: [
    InstallerComponent
  ],
  declarations: [InstallerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InstallerModule { }
