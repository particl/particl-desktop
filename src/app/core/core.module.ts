import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RpcService } from './services/rpc.service';
import { IpcService } from './services/ipc.service';
import { ConnectionService } from './services/connection.service';
import { CloseGuiService } from 'app/core/services/close-gui.service';


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
  ],
  providers: [
    ConnectionService,
    RpcService,
    IpcService,
    CloseGuiService
  ]
})

export class CoreModule {
  constructor() {
  }
}
