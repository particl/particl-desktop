import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { RpcStateService } from './rpc-state/rpc-state.service';

import { BlockStatusService } from './blockstatus/blockstatus.service';
import { NewTxNotifierService } from './new-tx-notifier/new-tx-notifier.service';
import { PeerService } from './peer/peer.service';
import { RpcService } from './rpc.service';

@NgModule({
  imports: [
    HttpClientModule
  ]
})
export class RpcModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: RpcModule,
      providers: [
        RpcService
      ]
    };
  }

  static forTest(): ModuleWithProviders {
    return this.forRoot();
  }
}

@NgModule({
  imports: [
    RpcModule.forRoot()
  ]
})
export class RpcWithStateModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: RpcWithStateModule,
      providers: [
        RpcStateService,
        BlockStatusService,
        NewTxNotifierService,
        PeerService
      ]
    };
  }
}

export { RpcStateService } from './rpc-state/rpc-state.service';

export { BlockStatusService } from './blockstatus/blockstatus.service'
export { PeerService } from './peer/peer.service';
export { NewTxNotifierService } from './new-tx-notifier/new-tx-notifier.service';
