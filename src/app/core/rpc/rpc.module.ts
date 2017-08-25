import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';


import { BlockStatusService } from './blockstatus.service'
import { ElectronService } from 'ngx-electron';
import { EncryptionStatusService } from './encryptionstatus.service'
import { PassphraseService } from './passphrase.service';
import { PeerService } from './peer.service';
import { RPCService } from './rpc.service';

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
        BlockStatusService,
        ElectronService,
        EncryptionStatusService,
        PassphraseService,
        PeerService,
        RPCService
      ]
    };
  }
}
export { BlockStatusService } from './blockstatus.service';
export { EncryptionStatusService } from './encryptionstatus.service';
export { PassphraseService } from './passphrase.service';
export { PeerService } from './peer.service';
export { RPCService } from './rpc.service';
