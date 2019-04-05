import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Log } from 'ng2-logger';
import { shareReplay } from 'rxjs/operators';

import { RpcService } from 'app/core/rpc/rpc.service';

@Injectable()
export class ConnectionCheckerService implements OnDestroy {

  log: any = Log.create('connection-checker.service id:' + Math.floor((Math.random() * 1000) + 1));
  destroyed: boolean = false;

  checkInterval: number = 1 * 1000; // milliseconds

  check: Observable<any>;
  observer: Observer<any>;

  // shareReplay
  constructor(private rpc: RpcService) {
    this.log.d(`connection-checker created`);
    this.check = Observable.create(observer => {
      this.observer = observer;
    }).pipe(shareReplay());

    // start checking
    // this.performCheck();
  }

  /**
   * Retries the 'getwalletinfo' rpc command, until the RPC endpoint is responsive.
   * Emits the getwalletinfo output & completes.
   */
  public whenRpcIsResponding(): Observable<any> {
    return this.check;
  }

  public performCheck() {
    if (!this.destroyed) {
      this.log.d('performing check');
      this.log.d(`connection-checker wallet:`, this.rpc.wallet);
      this.rpc.call('getwalletinfo', []).subscribe(
        (getwalletinfo: any) => this.RpcHasResponded(getwalletinfo),
        (error: any) => {
          if (error.code === -18) {
            this.rpc.wallet = '';
          }
          this.log.d('performCheck on rpc (error is normal here) ', error)
        }
      );


      setTimeout(this.performCheck.bind(this), this.checkInterval);
    }
  }

  private RpcHasResponded(getwalletinfo: any) {
    this.log.info('RPC is responsive, yay!');
    this.observer.next(getwalletinfo);
    this.observer.complete();
    this.destroyed = true;
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
