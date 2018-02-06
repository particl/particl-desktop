import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';


import { RpcService } from './rpc.service';
import { RpcStateService } from './rpc-state/rpc-state.service';

import { BlockStatusService } from './blockstatus/blockstatus.service';
import { NewTxNotifierService } from './new-tx-notifier/new-tx-notifier.service';
import { PeerService } from './peer/peer.service';

@NgModule({
  imports: [
    CommonModule,
  ]
})
export class RpcModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: RpcModule,
      providers: [
        RpcService,
        RpcStateService,
        BlockStatusService,
        NewTxNotifierService,
        PeerService
      ]
    };
  }
}


export { RpcService } from './rpc.service';
export { RpcStateService } from './rpc-state/rpc-state.service';

export { BlockStatusService } from './blockstatus/blockstatus.service'
export { PeerService } from './peer/peer.service';
export { NewTxNotifierService } from './new-tx-notifier/new-tx-notifier.service';
