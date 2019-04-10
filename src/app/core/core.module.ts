import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketModule } from './market/market.module';
import { ZmqService } from './zmq/zmq.service';
import { UpdaterService } from 'app/loading/updater.service';
import { IpcService } from './ipc/ipc.service';
import { SnackbarService } from './snackbar/snackbar.service';
import { NotificationService } from './notification/notification.service';
import { CloseGuiService } from './close-gui/close-gui.service';

  /*
    Loading the core library will intialize IPC & RPC
  */
@NgModule({
  imports: [
    CommonModule,
    MarketModule.forRoot()
  ]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        IpcService,
        ZmqService,
        UpdaterService,
        SnackbarService,
        NotificationService,
        CloseGuiService
      ]
    };
  }
  static forChild(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [

      ]
    };
  }
  constructor() {}
}

export { IpcService } from './ipc/ipc.service';
export { RpcService } from 'app/core/rpc/rpc.service';
export { RpcStateService } from './rpc/rpc-state/rpc-state.service';
export { NotificationService } from './notification/notification.service';
export { CloseGuiService } from './close-gui/close-gui.service';
export { BlockStatusService } from './rpc/blockstatus/blockstatus.service'
export { PeerService } from './rpc/peer/peer.service';
export { SnackbarService } from './snackbar/snackbar.service';
