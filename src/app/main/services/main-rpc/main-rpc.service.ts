import { Injectable, OnDestroy } from '@angular/core';
import { RpcService } from 'app/core/services/rpc.service';
import { Store } from '@ngxs/store';
import { AppSettingsState } from 'app/core/store/appsettings.state';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Injectable()
export class MainRpcService implements OnDestroy {

  private _currentWallet: string = '';
  private destroy$: Subject<void> = new Subject();

  constructor(
    private _rpc: RpcService,
    private _store: Store
  ) {
    this._store.select(AppSettingsState.activeWallet).pipe(
      takeUntil(this.destroy$)
    ).subscribe(
      (wallet) => {
        if (typeof wallet === 'string') {
          this._currentWallet = wallet;
        }
      }
    )
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  /**
   * Facade to the app rpc service: tracks the current wallet so requests to the current wallet don't need to
   *  track the current wallet as well.
   * @param method The method to call
   * @param params Any params to pass into the method.
   */
  call(method: string, params?: Array<any> | null): Observable<any> {
    return this._rpc.call(this._currentWallet, method, params);
  }

}
