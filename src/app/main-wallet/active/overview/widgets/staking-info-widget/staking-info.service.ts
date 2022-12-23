import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { retryWhen } from 'rxjs/operators';
import { ParticlRpcService } from 'app/networks/networks.module';
import { genericPollingRetryStrategy } from 'app/core/util/utils';
import { RPCResponses } from 'app/networks/particl/particl.models';


@Injectable()
export class StakingInfoService {

  constructor(
    private _rpc: ParticlRpcService
  ) { }


  getStakingStats(): Observable<RPCResponses.GetStakingInfo> {
    return this._rpc.call<RPCResponses.GetStakingInfo>('getstakinginfo').pipe(
      retryWhen (genericPollingRetryStrategy({maxRetryAttempts: 1})),
    );
  }
}
