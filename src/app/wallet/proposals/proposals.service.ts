import { Injectable } from '@angular/core';
import { RpcService } from 'app/core/rpc/rpc.service';
import { Proposal } from 'app/wallet/proposals/models/proposal.model';
import { MarketService } from 'app/core/market/market.service';
import { ProposalResult } from 'app/wallet/proposals/models/proposal-result.model';

@Injectable()
export class ProposalsService {

  constructor(
    private marketService: MarketService
  ) { }

  // proposal list.
  list(startBlock: number, endBlock: number) {
    const params = ['list', startBlock, endBlock];
    return this.marketService.call('proposal', params)
      .distinctUntilChanged((a: any, b: any) => JSON.stringify(a) === JSON.stringify(b))
      .map((v) => v.map(p => new Proposal(p)));
  }

  // proposal post.
  post(params: Array<any> = []) {
    return this.marketService.call('proposal', params);
  }

  // proposal results.
  result(proposalHash: string) {
    const params = ['results', proposalHash]
    return this.marketService.call('proposal', params).map((r) => new ProposalResult(r));
  }

  // vote post.
  vote(options: Array<any>) {
    const params = ['post', ...options]
    return this.marketService.call('vote', params);
  }
}
