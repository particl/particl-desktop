import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ElectronService } from 'ngx-electron';
import { RPCService } from './rpc.service';
import { PeerService } from './peer.service';
import { AddressService } from './address.service';
import { Address } from './models/address.model'
import { AddressCount } from './models/address-count.model'

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
        AddressService,
        ElectronService
      ]
    };
  }
}

// export { Address } from './models/address.model'
// export { AddressCount } from './models/address-count.model'
export { RPCService } from './rpc.service';
export { PeerService } from './peer.service';
export { AddressService } from './address.service';
