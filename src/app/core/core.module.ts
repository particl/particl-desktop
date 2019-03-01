import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { RpcModule } from './rpc/rpc.module';
import { MarketModule } from './market/market.module';

import { IpcService } from './ipc/ipc.service';
import { RpcService } from './rpc/rpc.service';
import { ZmqService } from './zmq/zmq.service';

import { UpdaterService } from './updater/updater.service';

import { NotificationService } from './notification/notification.service';
import { CloseGuiService } from './close-gui/close-gui.service';

import { BlockStatusService } from './rpc/blockstatus/blockstatus.service'
import { PeerService } from './rpc/peer/peer.service';
import { SnackbarService } from './snackbar/snackbar.service';
import { UpdaterComponent } from './updater/modal/updater.component';

// This is seriously the only UI import.
import { MatDialogModule } from '@angular/material';
import { ProposalsNotificationsService } from 'app/core/market/proposals-notifier/proposals-notifications.service';

  /*
    Loading the core library will intialize IPC & RPC
  */
@NgModule({
  imports: [
    CommonModule,
    RpcModule.forRoot(), // TODO: should be here?
    MarketModule.forRoot(),
    MatDialogModule
  ],
  exports: [
    HttpClientModule
  ],
  declarations: [UpdaterComponent],
  entryComponents: [ UpdaterComponent ]
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
        CloseGuiService,
        ProposalsNotificationsService
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
}

export { IpcService } from './ipc/ipc.service';
export { RpcService } from './rpc/rpc.service';
export { RpcStateService } from './rpc/rpc-state/rpc-state.service';
export { UpdaterService } from './updater/updater.service';
export { NotificationService } from './notification/notification.service';
export { CloseGuiService } from './close-gui/close-gui.service';
export { BlockStatusService } from './rpc/blockstatus/blockstatus.service'
export { PeerService } from './rpc/peer/peer.service';
export { SnackbarService } from './snackbar/snackbar.service';
