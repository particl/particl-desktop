import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';


import { RpcService } from './rpc.service';

import { BlockStatusService } from './blockstatus/blockstatus.service'
import { PeerService } from './peer/peer.service';
import { StateService } from '../state/state.service';


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
        BlockStatusService,
        PeerService,
        StateService
      ]
    };
  }
}


export { RpcService } from './rpc.service';

export { BlockStatusService } from './blockstatus/blockstatus.service'
export { PeerService } from './peer/peer.service';
export { StateService } from '../state/state.service';
