import { Injectable } from '@angular/core';
import { RpcService } from 'app/core/rpc/rpc.service';
import { Proposal } from 'app/wallet/proposals/models/proposal';

@Injectable()
export class ProposalsService {

  constructor(private _rpc: RpcService) { }

  // post vote.
  list() {
    const params = ['list'];
    return this._rpc.call('proposal', params)
      .distinctUntilChanged((a: any, b: any) => JSON.stringify(a) === JSON.stringify(b))
      .map((v) => v.map(p => new Proposal(p)));
  }

  // post proposal.
  post(params: Array<any> = []) {
    return this._rpc.call('proposal', params);
  }

  // post vote.
  vote(options: Array<any>) {
    const params = ['post', ...options]
    return this._rpc.call('vote', params);
  }
}
