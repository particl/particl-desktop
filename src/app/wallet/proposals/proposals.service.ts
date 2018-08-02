import { Injectable } from '@angular/core';
import { RpcService } from 'app/core/rpc/rpc.service';
import { Proposal } from 'app/wallet/proposals/models/proposal';
import { MarketService } from 'app/core/market/market.service';

@Injectable()
export class ProposalsService {

  constructor(
    private marketService: MarketService) { }

  // post vote.
  list(startBlock: number, endBlock: number) {
    const params = ['list', startBlock, endBlock];
    return this.marketService.call('proposal', params)
      .distinctUntilChanged((a: any, b: any) => JSON.stringify(a) === JSON.stringify(b))
      .map((v) => v.map(p => new Proposal(p)));
  }

  // post proposal.
  post(params: Array<any> = []) {
    return this.marketService.call('proposal', params);
  }

  // post vote.
  vote(options: Array<any>) {
    const params = ['post', ...options]
    return this.marketService.call('vote', params);
  }
}
