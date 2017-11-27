import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';

import { RpcModule } from './rpc/rpc.module';

import { IpcService } from './ipc/ipc.service';
import { RpcService } from './rpc/rpc.service';
import { BlockStatusService } from './rpc/blockstatus/blockstatus.service'
import { PeerService } from './rpc/peer/peer.service';
import { StateService } from './state/state.service';
import { WindowService } from './window/window.service';
import { SnackbarService } from './snackbar/snackbar.service';

  /*
	Loading the core library will intialize IPC & RPC
  */
@NgModule({
  imports: [
    CommonModule,
    RpcModule.forRoot() // TODO: should be here?
  ],
  exports: [
    HttpModule

  ],
  declarations: []
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        IpcService,
        WindowService,
        SnackbarService
      ]
    };
  }
}

export { WindowService } from './window/window.service';

export { IpcService } from './ipc/ipc.service';
export { RpcService } from './rpc/rpc.service';
export { BlockStatusService } from './rpc/blockstatus/blockstatus.service'
export { PeerService } from './rpc/peer/peer.service';
export { SnackbarService } from './snackbar/snackbar.service';
export { StateService } from './state/state.service';

