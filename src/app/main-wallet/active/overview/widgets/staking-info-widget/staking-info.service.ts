import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { Observable } from 'rxjs';
import { retryWhen } from 'rxjs/operators';
import { RpcGetStakingInfo } from './staking-info-widget.models';
import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { genericPollingRetryStrategy } from 'app/core/util/utils';


@Injectable()
export class StakingInfoService implements OnDestroy {


  private log: any = Log.create('staking-info.service id:' + Math.floor((Math.random() * 1000) + 1));


  constructor(
    private _rpc: MainRpcService
  ) {
    this.log.d('service initializing');
  }


  ngOnDestroy() {
    this.log.d('service destroyed');
  }


  getStakingStats(): Observable<RpcGetStakingInfo> {
    return this._rpc.call('getstakinginfo').pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: 1})),
    );
  }
}
