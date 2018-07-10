import { Log } from 'ng2-logger';
import { RpcService } from '../rpc.service';
import { OnDestroy, OnInit } from '@angular/core';
import { ConnectionCheckerService } from 'app/loading/connection-checker.service';

export class RpcStateClass implements OnDestroy, OnInit {
  private log: any = Log.create('rpc-state.class');

  private destroyed: boolean = false;
  constructor(
    private _rpc: RpcService,
    private con: ConnectionCheckerService
  ) { }

  ngOnInit() {
    this.con.whenRpcIsResponding().subscribe(
      (getwalletinfo) => this.callRegisterStateCalls(),
      (error) => this.log.d('whenRpcIsResponding errored')
    );
  }

  callRegisterStateCalls() {
    // Start polling...
    this._rpc.registerStateCall('getwalletinfo', 1000);
    this._rpc.registerStateCall('getblockchaininfo', 5000);
    this._rpc.registerStateCall('getnetworkinfo', 10000);
    this._rpc.registerStateCall('getstakinginfo', 10000);

    this.lastBlockTimeState();
    this.blockLoop();
    this.walletLockedState();
    this.coldStakeHook();
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

  /*
  * coldStakeHook
  *   Subscribes to general unlock events and makes use of the time to
  *   update the coldstaking state.
  */
  private coldStakeHook() {
    // TODO: Remove
    this._rpc.state.observe('locked')
      .takeWhile(() => !this.destroyed)
      .subscribe(locked => {
        // TODO: replace with getcoldstakinginfo.enabled
        if (locked === false) {
          // only available if unlocked
          this._rpc.call('walletsettings', ['changeaddress'])
            .subscribe(
              // set state for coldstaking
              response => this._rpc.state.set('ui:coldstaking',
                response.changeaddress === 'default'
                  ? false
                  : !!response.changeaddress.coldstakingaddress
              ),
              error => this.log.er('walletsettings changeaddress', error)
            );
        }
      });
  }
}
