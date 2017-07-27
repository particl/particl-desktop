import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ElectronService } from 'ngx-electron';
import { RPCService } from './rpc.service';
import { PeerService } from './peer.service';
import { BlockStatusService } from './blockstatus.service'

@NgModule({
  imports: [
    CommonModule
  ]
})
export class RpcModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: RpcModule,
      providers: [
        RPCService,
        PeerService,
        BlockStatusService,
        ElectronService
      ]
    };
  }
}
export { RPCService } from './rpc.service';
export { PeerService } from './peer.service';
export { BlockStatusService } from './blockstatus.service'
