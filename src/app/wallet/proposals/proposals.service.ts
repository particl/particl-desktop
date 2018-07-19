import { Injectable } from '@angular/core';
import { RpcService } from 'app/core/rpc/rpc.service';

@Injectable()
export class ProposalsService {

  constructor(private _rpc: RpcService) { }

  // post proposal.
  post(method: string, options: Array<any> = []) {
    return this._rpc.call(method, options);
  }

}
