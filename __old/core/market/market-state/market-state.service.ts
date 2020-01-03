import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';

import { StateService } from 'app/core/state/state.service';
import { MarketService } from 'app/core/market/market.service';
import { finalize } from 'rxjs/operators';

@Injectable()
export class MarketStateService extends StateService implements OnDestroy {

  private log: any = Log.create('market-state.service id: ' + Math.floor((Math.random() * 1000) + 1));
  private destroyed: boolean = false;
  private _enableState: boolean = true;
  private stateTimeouts: any = {};

  constructor(private market: MarketService) {
    super();
    this.log.d('MarketState: initialized');
  }

  start(): void {
    this._enableState = true;
    this.register('profile', 60 * 1000, ['list']);
    this.register('bid', 15 * 1000, ['search', 0, 99999, 'ASC', '*', 'MPA_BID', ''])
  }

  stop() {
    Object.keys(this.stateTimeouts).forEach(method => {
      clearTimeout(this.stateTimeouts[method]);
    });
    this.stateTimeouts = {};
    this._enableState = false;
    this.clear();
  }

  /** Register a state call, executes every X seconds (timeout) */
  register(method: string, timeout: number, params?: Array<any> | null): void {
    // Keep track of errors, and poll accordingly
    let errors = 0;

    // loop procedure
    const _call = () => {
      if (this.destroyed || ! this._enableState) {
        return;
      }

      const preflightTimeout = this.stateTimeouts[method];

      this.market.call(method, params)
        .pipe(finalize(() => {
          // re-start loop
          if (timeout) {
            if (this._enableState && preflightTimeout === this.stateTimeouts[method] ) {
              const restartAfter = this.determineTimeoutDuration(errors, timeout);
              this.stateTimeouts[method] = setTimeout(_call, restartAfter);
            }
          }
        }))
        .subscribe(
        success => {
          this.set(method, success);
          errors = 0;
        },
        error => {
          this.log.er(`register(): Market RPC Call ${method} returned an error:`, error);
          errors++;
        });
    };

    // initiate loop
    _call();
  }

  determineTimeoutDuration(errors: number, timeout: number): number {
    let restartAfter: number = timeout;

    // if error occurred
    if (errors > 0) {
      if (errors < 30) {
        // might be booting up, let's retry after 1s
        restartAfter = 1000;
      } else {
        // wait 10 seconds or timeout duration
        // whichever is the longest.
        restartAfter = timeout > 10000 ? timeout : 10000;
      }
      // if no error occured
      // just use normal timeout
    } else {
      restartAfter = timeout;
    }
    return restartAfter;
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
