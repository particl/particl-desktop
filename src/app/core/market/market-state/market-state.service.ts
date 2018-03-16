import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';

import { StateService } from 'app/core/state/state.service';
import { MarketService } from 'app/core/market/market.service';

@Injectable()
export class MarketStateService extends StateService implements OnDestroy {

  private log: any = Log.create('market-state.service');
  private destroyed: boolean = false;

  constructor(private market: MarketService) {
    super();
    this.log.d('MarketState: initialized');
    // fetch categories
    this.registerStateCall('category', 5 * 1000, ['list']);
    this.registerStateCall('cartitem', null, ['list', 1, true]);
    this.registerStateCall('currencyprice', 30 * 1000, ['PART', 'USD']);
  }

  /** Register a state call, executes every X seconds (timeout) */
  registerStateCall(method: string, timeout: number, params?: Array<any> | null): void {
      let firstError = true;
      // loop procedure
      const _call = () => {
        if (this.destroyed) {
          // RpcState service has been destroyed, stop.
          return;
        }
        this.market.call(method, params)
          .subscribe(
            success => {
              this.stateCallSuccess(method, success);

              // re-start loop after timeout
              if (timeout) {
                setTimeout(_call, timeout);
              }
            },
            error => {
              this.stateCallError(method, error, firstError);
              if (timeout) {
                setTimeout(_call, firstError ? 250 : error.status === 0 ? 500 : 10000);
              }
              firstError = false;
            });
      };

      // initiate loop
      _call();
  }

    /** Updates the state whenever a state call succeeds */
    private stateCallSuccess(method: string, response: any) {
      // no error
      this.set(method, response);
    }

    /** Updates the state when the state call errors */
    private stateCallError(method: string, error: any, firstError: boolean) {
      this.log.er(`stateCallError(): Market RPC Call ${method} returned an error:`, error);
    }

    ngOnDestroy() {
      this.destroyed = true;
    }

}
