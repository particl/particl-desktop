import { Injectable } from '@angular/core';
import { Proposal } from 'app/wallet/proposals/models/proposal.model';
import { MarketService } from 'app/core/market/market.service';
import { ProposalResult } from 'app/wallet/proposals/models/proposal-result.model';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { Profile } from 'app/core/market/api/profile/profile.model';
import { VoteDetails } from 'app/wallet/proposals/models/vote-details.model';

@Injectable()
export class ProposalsService {
  public submitterId: number;

  constructor(
    private marketService: MarketService,
    private profileService: ProfileService
  ) {
    this.profileService.default().subscribe((profile: Profile) => {
      this.submitterId = profile.id;
    })
  }

  // proposal list.
  list(startBlock: any, endBlock: any) {
    const params = ['list', startBlock, endBlock];
    return this.marketService.call('proposal', params)
      .map((v) => v.map(p => new Proposal(p)));
  }

  // proposal post.
  post(options: Array<any> = []) {
    const params = ['post', this.submitterId, ...options]
    return this.marketService.call('proposal', params);
  }

  // proposal result.
  result(proposalHash: string) {
    const params = ['result', proposalHash]
    return this.marketService.call('proposal', params).map((r) => new ProposalResult(r));
  }

  // vote post.
  vote(options: Array<any>) {
    const params = ['post', this.submitterId, ...options]
    return this.marketService.call('vote', params);
  }

  // get current vote details.
  get(proposalHash: string) {
    const params = ['get', this.submitterId, proposalHash];
    return this.marketService.call('vote', params).map((v) => new VoteDetails(v));
  }
}
