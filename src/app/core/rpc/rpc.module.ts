import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlockStatusService } from './blockstatus.service'
import { PeerService } from './peer.service';
import { RPCService } from './rpc.service';
import { RPXService } from './rpx.class';
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
        BlockStatusService,
        PeerService,
        RPCService,
        RPXService,
        StateService
      ]
    };
  }
}
export { BlockStatusService } from './blockstatus.service';
export { PeerService } from './peer.service';
export { RPCService } from './rpc.service';
