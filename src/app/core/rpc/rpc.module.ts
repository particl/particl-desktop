import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';

import { BlockStatusService } from './blockstatus.service'
import { ElectronService } from 'ngx-electron';
import { EncryptionStatusService } from './encryptionstatus.service'
import { PeerService } from './peer.service';
import { RPCService } from './rpc.service';

import { reducer } from './chain-state/chain-state.reducers';

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forRoot(<any>{chain: reducer})
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
        PeerService,
        RPCService
      ]
    };
  }
}
export { BlockStatusService } from './blockstatus.service';
export { EncryptionStatusService } from './encryptionstatus.service';
export { PeerService } from './peer.service';
export { RPCService } from './rpc.service';
