
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackendService } from './services/backend.service';
import { CloseGuiService } from './services/close-gui.service';
import { MotdService } from './services/motd.service';


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
  ],
  exports: [
  ],
  providers: [
    BackendService,
    CloseGuiService,
    MotdService,
  ]
})

export class CoreModule {
  constructor() {
  }
}
