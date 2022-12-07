import { NgModule } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import {
  ParticlActions,
  ParticlCoreState,
  ParticlZMQState,
  ParticlBlockchainState,
  WalletInfoState,
  WalletBalanceState,
  WalletStakingState,
} from './particl/particl.state';
import { RpcService } from './particl/rpc.service';
import { ParticlWalletService } from './particl/wallet.service';


@NgModule({
  declarations: [
  ],
  imports: [
    NgxsModule.forFeature([
        ParticlCoreState,
        ParticlZMQState,
        ParticlBlockchainState,
        WalletInfoState,
        WalletBalanceState,
        WalletStakingState,
    ]),
  ],
  providers: [
    RpcService,
    ParticlWalletService,
  ],
  entryComponents: [ ],
  schemas: []
})
export class NetworksModule {
  constructor() { }
}

export namespace Particl {
  export const Actions = ParticlActions;

  export namespace State {
    export const Core = ParticlCoreState;
    export const ZMQ = ParticlZMQState;
    export const Blockchain = ParticlBlockchainState;
    export namespace Wallet {
      export const Info = WalletInfoState;
      export const Balance = WalletBalanceState;
      export const Staking = WalletStakingState;
    }
  }
}

export { RpcService as ParticlRpcService, ParticlWalletService };
