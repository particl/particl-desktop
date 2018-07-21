import { Injectable } from '@angular/core';
import { RpcService } from 'app/core/rpc/rpc.service';

@Injectable()
export class ProposalsService {

  constructor(private _rpc: RpcService) { }

  // post proposal.
  post(params: Array<any> = []) {
    return this._rpc.call('proposal', params);
  }

  // post vote.
  vote(options: Array<any>) {
    const params = ['post', ... options]
    return this._rpc.call('vote', params);
  }
}
