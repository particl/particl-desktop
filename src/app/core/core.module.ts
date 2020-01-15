import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RpcService } from './services/rpc.service';
import { IpcService } from './services/ipc.service';
import { ConnectionService } from './services/connection.service';
import { CloseGuiService } from './services/close-gui.service';
import { PollingService } from './services/polling.service';


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
  ],
  exports: [
  ],
  providers: [
    ConnectionService,
    RpcService,
    IpcService,
    CloseGuiService,
    PollingService
  ]
})

export class CoreModule {
  constructor() {
  }
}
