import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from '../core-ui/material/material.module';
import { DirectivesModule } from 'app/core-ui/directives/directives.module';

import { ModalsService } from './modals.service';
import { SnackbarService } from '../core/snackbar/snackbar.service';

import { ModalsComponent } from './modals.component';

/* modals */
import { ColdstakeComponent } from './coldstake/coldstake.component';
import { SyncingComponent } from './syncing/syncing.component';
import { UnlockwalletComponent } from './unlockwallet/unlockwallet.component';
/* shared in modals */
import { PasswordComponent } from './shared/password/password.component';
import { MultiwalletComponent } from './multiwallet/multiwallet.component';






@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    ClipboardModule,
    /* own */
    MaterialModule,
    DirectivesModule
  ],
  declarations: [
    ModalsComponent,
    PasswordComponent,
    SyncingComponent,
    UnlockwalletComponent,
    ColdstakeComponent,
    MultiwalletComponent
  ],
  exports: [
    ModalsComponent,
    ClipboardModule,
  ],
  providers: [
    ModalsService,
    SnackbarService
  ],
  entryComponents: [
    ModalsComponent,
    SyncingComponent,
    UnlockwalletComponent,
  ],
})
export class ModalsModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: ModalsModule,
      providers: [
        ModalsService
      ]
    };
  }
}

export { ModalsService } from './modals.service';
