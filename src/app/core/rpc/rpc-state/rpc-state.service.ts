import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { Subject } from 'rxjs';


import { StateService } from 'app/core/state/state.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { takeWhile } from 'rxjs/operators';

@Injectable()
export class RpcStateService extends StateService implements OnDestroy {

  private log: any = Log.create('rpc-state.service id:' + Math.floor((Math.random() * 1000) + 1));
  private destroyed: boolean = false;

  private _enableState: boolean = true;
  private stateTimeouts: any = {};

  /** errors gets updated everytime the stateCall RPC requests return an error */
  public errorsStateCall: Subject<any> = new Subject<any>();

  constructor(private _rpc: RpcService) {
    super();
  }

  start(): void {
    this.log.d('Rpc-State Service Started');
    this._enableState = true;
    this.register('getwalletinfo', 5000);
    this.register('listunspent', 5000, [0]);
    this.register('getblockchaininfo', 5000);
    this.register('getnetworkinfo', 10000);
    this.register('getstakinginfo', 10000);
    this.register('getcoldstakinginfo', 10000);

    // TODO: get rid of these
    this.walletLockedState();
  }

  stop() {
    Object.keys(this.stateTimeouts).forEach(method => {
      clearTimeout(this.stateTimeouts[method]);
    });
    this.stateTimeouts = {};
    this._enableState = false;
    this.clear();
    this.log.d('Rpc-State Service stopped');
  }

  /**
   * Make an RPC Call that saves the response in the state service.
   *
   * @param {string} method  The JSON-RPC method to call, see ```./particld help```
   *
   * The rpc call and state update will only take place while `this._enableState` is `true`
   *
   * @example
   * ```JavaScript
   * this._rpcState.stateCall('getwalletinfo');
   * ```
   */
  stateCall(method: string): void {
    if (!this._enableState || !this._rpc.enabled) {
      return;
    } else {
      this._rpc.call(method)
      .subscribe(
        response => this.stateCallSuccess(method, response),
        error => this.stateCallError(method, error, false));
    }
  }

  /** Register a state call, executes every X seconds (timeout) */
  register(method: string, timeout: number, params?: Array<any> | null): void {
    if (timeout) {
      let firstError = true;

      // loop procedure
      const _call = () => {
        if (this.destroyed || !this._enableState) {
          return;
        }
        const preflightTimeout = this.stateTimeouts[method];
        this._rpc.call(method, params)
          .pipe(takeWhile(() => this._enableState && preflightTimeout === this.stateTimeouts[method] ))
          .subscribe(
            success => {
              this.stateCallSuccess(method, success);

              // re-start loop after timeout
              this.stateTimeouts[method] = setTimeout(_call, timeout);
            },
            error => {
              this.stateCallError(method, error, firstError);

              this.stateTimeouts[method] = setTimeout(_call, firstError ? 250 : error.status === 0 ? 500 : 10000);
              firstError = false;
            });
      };

      // initiate loop
      _call();
    }
  }

  /** Updates the state whenever a state call succeeds */
  private stateCallSuccess(method: string, response: any) {
    // no error
    this.errorsStateCall.next({
      error: false
    });

    this.set(method, response);
  }

  /** Updates the state when the state call errors */
  private stateCallError(method: string, error: any, firstError: boolean) {
    this.log.er(`stateCallError(): RPC Call ${method} returned an error:`, error);

    // if not first error, show modal
    if (!firstError) {
      this.errorsStateCall.next({
        error: error.target ? error.target : error
      });
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  // TODO: get rid of these some day..

  private walletLockedState() {
    this.observe('getwalletinfo', 'encryptionstatus')
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe(status => {
        this.log.d(' [rm] updating locked state maybe', status);
        this.set('locked', ['Locked', 'Unlocked, staking only'].includes(status));
      });
  }

}
