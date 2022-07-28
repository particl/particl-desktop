
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RpcService } from './services/rpc.service';
import { IpcService } from './services/ipc.service';
import { BackendService } from './services/backend.service';
import { ConnectionService } from './services/connection.service';
import { CloseGuiService } from './services/close-gui.service';
import { PollingService } from './services/polling.service';
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
    ConnectionService,
    RpcService,
    IpcService,
    BackendService,
    CloseGuiService,
    PollingService,
    MotdService,
  ]
})

export class CoreModule {
  constructor() {
  }
}
