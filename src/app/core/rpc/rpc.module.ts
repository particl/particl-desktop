import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ElectronService } from 'ngx-electron';
import { RPCService } from './rpc.service';
import { PeerService } from './peer.service';
import { PassphraseService } from './passphrase.service';
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
        ElectronService,
        RPCService,
        PeerService,
        PassphraseService,
        BlockStatusService
      ]
    };
  }
}
export { RPCService } from './rpc.service';
export { PeerService } from './peer.service';
export { PassphraseService } from './passphrase.service';
export { BlockStatusService } from './blockstatus.service'
