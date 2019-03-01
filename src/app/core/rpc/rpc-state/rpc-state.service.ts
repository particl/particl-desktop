import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { Subject } from 'rxjs';


import { StateService } from 'app/core/state/state.service';
import { RpcService } from 'app/core/rpc/rpc.service';

@Injectable()
export class RpcStateService extends StateService implements OnDestroy {

  private log: any = Log.create('rpc-state.service id:' + Math.floor((Math.random() * 1000) + 1));
  private destroyed: boolean = false;

  private _enableState: boolean = true;
  private _services: any[] = [];
  private _timeouts: any[] = [];

  /** errors gets updated everytime the stateCall RPC requests return an error */
  public errorsStateCall: Subject<any> = new Subject<any>();

  constructor(private _rpc: RpcService) {
    super();
  }

  start(): void {
    this._enableState = true;
    this.register('getwalletinfo', 5000);
    this.register('getblockchaininfo', 5000);
    this.register('getnetworkinfo', 10000);
    this.register('getstakinginfo', 10000);
    this.register('getcoldstakinginfo', 10000);

    // TODO: get rid of these
    this.walletLockedState();
  }

  stop() {
    this._enableState = false;
    console.log('########### STOPPING RPC STATE', this._enableState)
    this._timeouts.forEach((timeout) => {
      console.log(timeout);
      clearTimeout(timeout;
    })
    this.clear();
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

  refreshState(): Promise<any> {
    const self = this;
    return new Promise(function(resolve: any) {
      if (self._enableState) {
        const services = [];
        self._services.forEach(service => {
          services.push(self._makeServiceCall(service.method, service.params));
        });
        Promise.all(services).then(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  private _makeServiceCall(method: string, params?: Array<any>): Promise<any> {
    const self = this;
    return new Promise(function(resolve: any, reject: any) {
      self._rpc.call(method, params)
        .subscribe(
          success => {
            self.stateCallSuccess(method, success);
            resolve(success);
          },
          error => {
            self.stateCallError(method, error, false);
            reject(error);
          });
    });
  }

  /** Register a state call, executes every X seconds (timeout) */
  register(method: string, timeout: number, params?: Array<any> | null): void {
    // this._services.push({
    //   method,
    //   timeout,
    //   params
    // });
    if (timeout) {
      let firstError = true;

      console.log('register', this);
      // loop procedure
      const _call = () => {
        console.log('_call', this);

        if (this.destroyed || !this._enableState) {
          // RpcState service has been destroyed, stop.
          return;
        }
        console.log('################# CANCELLING STATE ', this._enableState);
        if (!this._enableState) {
          return;
        }
        console.log('## rpc call', method, params);
        this._rpc.call(method, params)
          .takeWhile(() => this._enableState )
          .subscribe(
            success => {
              this.stateCallSuccess(method, success);
              console.log('success', this);

              // re-start loop after timeout
              this._timeouts.push(setTimeout(_call, timeout));
            },
            error => {
              this.stateCallError(method, error, firstError);

              this._timeouts.push(setTimeout(_call, firstError ? 250 : error.status === 0 ? 500 : 10000));
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
    this.stop();
    this.destroyed = true;
  }



  // TODO: get rid of these some day..

  private walletLockedState() {
    this.observe('getwalletinfo', 'encryptionstatus')
      .takeWhile(() => !this.destroyed)
      .subscribe(status => {
        this.log.d(' [rm] updating locked state maybe', status);
        this.set('locked', ['Locked', 'Unlocked, staking only'].includes(status));
      });
  }

}
