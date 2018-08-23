import {
  NgModule,
  CUSTOM_ELEMENTS_SCHEMA,
  ModuleWithProviders
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { MaterialModule } from 'app/core-ui/material/material.module';
import { RouterModule } from '@angular/router';

import { MultiwalletSidebarComponent } from './multiwallet-sidebar.component';
import { MultiwalletService } from './multiwallet.service';

@NgModule({
  imports: [CommonModule, RouterModule, MaterialModule],
  exports: [MultiwalletSidebarComponent],
  declarations: [MultiwalletSidebarComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MultiwalletModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MultiwalletModule,
      providers: [MultiwalletService]
    };
  }

  static forTest(): ModuleWithProviders {
    const root = this.forRoot();
    root.providers.push(HttpClient);
    return root;
  }
}
