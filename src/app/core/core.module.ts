import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RpcService } from './services/rpc.service';
import { IpcService } from './services/ipc.service';
import { ConnectionService } from './services/connection.service';


@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
  ],
  providers: [
    ConnectionService,
    // RpcService,
    IpcService
  ]
})

export class CoreModule {
  constructor() {
  }
}
