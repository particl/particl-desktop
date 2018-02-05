import { Log } from 'ng2-logger';
import { RpcService } from '../rpc.service';
import { OnDestroy } from '@angular/core';
import { RpcStateService } from 'app/core/core.module';

export class RpcStateClass implements OnDestroy {
  private log: any = Log.create('rpc-state.class');

  private destroyed: boolean = false;
  constructor(
    private _rpc: RpcService,
    private _rpcState: RpcStateService
  ) {

    // Start polling...

/*
    this.lastBlockTimeState();
    this.blockLoop();
    this.walletLockedState();
    this.coldStakeHook();
    this.initWalletState();
    */
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  private lastBlockTimeState() {
    let _checkLastBlock = false;
    this._rpcState.observe('getblockchaininfo', 'mediantime')
      .takeWhile(() => !this.destroyed)
      .subscribe(mediantime => {
        const now = new Date().getTime() - (4 * 60 * 1000);
        const lastblocktime = new Date(mediantime * 1000);
        if (!_checkLastBlock && now > lastblocktime.getTime()) {
          _checkLastBlock = true;
          setTimeout(() => {
            _checkLastBlock = false;
            this._rpcState.stateCall('getblockchaininfo');
          }, 100);
        }
      });
  }

  private blockLoop() {
    if (this._rpcState.get('getblockchaininfo').blocks === 0) {
      setTimeout(this.blockLoop.bind(this), 1000);
    }
    this._rpcState.stateCall('getblockchaininfo');
  }

  private walletLockedState() {
    this._rpcState.observe('getwalletinfo', 'encryptionstatus')
      .takeWhile(() => !this.destroyed)
      .subscribe(status => {
        this._rpcState
          .set('locked', ['Locked', 'Unlocked, staking only'].includes(status));
      });
  }

  private initWalletState() {
        this._rpc.call('getwalletinfo').subscribe(response => {
          // check if account is active
          if (!!response.hdmasterkeyid) {
            this._rpcState.set('ui:walletInitialized', true);
          } else {
            this._rpcState.set('ui:walletInitialized', false);
          }
        }, error => this.log.er('RPC Call returned an error', error));
  }
}
