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

    this.loadSubmitterId();
  }

  loadSubmitterId(): void {
    this.profileService.default().subscribe((profile: Profile) => {
      if (profile) {
        this.submitterId = profile.id;
      }
    })
  }

  // proposal list.
  list(startTime: any = 0, expireTime: any = '*') {
    const params = ['list', startTime, expireTime];
    return this.marketService.call('proposal', params)
      .map((v) => v.map(p => new Proposal(p)));
  }

  // proposal post.
  post(options: Array<any> = []) {
    /*
     * get poposal fee by passing the estimatedFee = true.
     // tslint:disable-next-line
     * cmd ['proposal', ['post', submitterId, ttitle<string>, desc<string>, daysretention<number> (in days),
        expireTimeCount<number>, estimationFee<boolean>, option-1<string> ,..... option-N<string>
     * i.e.:
     * estimationFee = true to get proposal fee.
     * estimationFee = false to post proposal.
     */

    const params = ['post', this.submitterId, ...options]
    return this.marketService.call('proposal', params);
  }

  // proposal result.
  result(proposalHash: string) {
    const params = ['result', proposalHash]
    return this.marketService.call('proposal', params).map((r) => {
      if (r) {
        return new ProposalResult(r);
      }
      return null;
    });
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
