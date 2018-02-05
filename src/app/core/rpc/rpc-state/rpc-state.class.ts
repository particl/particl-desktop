import { Log } from 'ng2-logger';
import { RpcService } from '../rpc.service';
import { OnDestroy } from '@angular/core';

export class RpcStateClass implements OnDestroy {
  private log: any = Log.create('rpc-state.class');

  private destroyed: boolean = false;
  constructor(private _rpc: RpcService) {

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
    this._rpc.state.observe('mediantime')
      .takeWhile(() => !this.destroyed)
      .subscribe(mediantime => {
        const now = new Date().getTime() - (4 * 60 * 1000);
        const lastblocktime = new Date(mediantime * 1000);
        if (!_checkLastBlock && now > lastblocktime.getTime()) {
          _checkLastBlock = true;
          setTimeout(() => {
            _checkLastBlock = false;
            this._rpc.stateCall('getblockchaininfo');
          }, 100);
        }
      });
  }

  private blockLoop() {
    if (this._rpc.state.get('blocks') === 0) {
      setTimeout(this.blockLoop.bind(this), 1000);
    }
    this._rpc.stateCall('getblockchaininfo');
  }

  private walletLockedState() {
    this._rpc.state.observe('encryptionstatus')
      .takeWhile(() => !this.destroyed)
      .subscribe(status => {
        this._rpc.state
          .set('locked', ['Locked', 'Unlocked, staking only'].includes(status));
      });
  }

  private initWalletState() {
        this._rpc.call('getwalletinfo').subscribe(response => {
          // check if account is active
          if (!!response.hdmasterkeyid) {
            this._rpc.state.set('ui:walletInitialized', true);
          } else {
            this._rpc.state.set('ui:walletInitialized', false);
          }
        }, error => this.log.er('RPC Call returned an error', error));
  }
}
