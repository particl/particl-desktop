import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ElectronService } from 'ngx-electron';
import { RPCService } from './rpc.service';
import { PeerService } from './peer.service';

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
        ElectronService
      ]
    };
  }
}
export { RPCService } from './rpc.service';
export { PeerService } from './peer.service';
