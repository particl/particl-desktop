import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RpcWithStateModule } from './rpc/rpc.module';
import { MarketModule } from './market/market.module';

import { IpcService } from './ipc/ipc.service';
import { ZmqService } from './zmq/zmq.service';

import { NotificationService } from './notification/notification.service';
import { SnackbarService } from './snackbar/snackbar.service';

  /*
    Loading the core library will intialize IPC & RPC
  */
@NgModule({
  imports: [
    CommonModule,
    RpcWithStateModule.forRoot(), // TODO: replace with just Rpc one day
    MarketModule.forRoot(),
  ]
})
export class CoreModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [
        IpcService,
        ZmqService,
        SnackbarService,
        NotificationService
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
  static forTest(): ModuleWithProviders {
    const root = this.forRoot();
    // TODO: provide useValue for RpcService and
    // set a default wallet
    return root;
  }

}

export { IpcService } from './ipc/ipc.service';
export { RpcService } from './rpc/rpc.service';
export { RpcStateService } from './rpc/rpc-state/rpc-state.service';
export { NotificationService } from './notification/notification.service';
export { BlockStatusService } from './rpc/blockstatus/blockstatus.service'
export { PeerService } from './rpc/peer/peer.service';
export { SnackbarService } from './snackbar/snackbar.service';
