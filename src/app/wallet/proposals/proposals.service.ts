import { Injectable } from '@angular/core';
import { Proposal } from 'app/wallet/proposals/models/proposal.model';
import { MarketService } from 'app/core/market/market.service';
import { ProposalResult } from 'app/wallet/proposals/models/proposal-result.model';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { Profile } from 'app/core/market/api/profile/profile.model';
import { VoteDetails } from 'app/wallet/proposals/models/vote-details.model';
import { Subscription, of } from 'rxjs';
import { Log } from 'ng2-logger';
import { map } from 'rxjs/operators';

@Injectable()
export class ProposalsService {
  private log: any = Log.create('proposals.service id:' + Math.floor((Math.random() * 1000) + 1));

  public submitterId: number;
  private profile$: Subscription;
  private isEnabled: boolean = false;

  constructor(
    private marketService: MarketService,
    private profileService: ProfileService
  ) {}

  start() {
    this.log.d('Starting service');
    this.isEnabled = true;
    this.profile$ = this.profileService.default().subscribe((profile: Profile) => {
      this.submitterId = profile.id;
    });
  }

  stop() {
    this.log.d('Stopping service');
    this.isEnabled = false;
    this.profile$.unsubscribe();
  }

  // proposal list.
  list(startTime: any, expireTime: any) {
    if (!this.isEnabled) {
      return of([]);
    }
    const params = ['list', startTime, expireTime];
    return this.marketService.call('proposal', params)
      .pipe(map((v) =>
        v.map(p => new Proposal(p))));
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
    return this.marketService.call('proposal', params)
    .pipe(map((r) => {
      if (r) {
        return new ProposalResult(r);
      }
      return null;
    }));
  }

  // vote post.
  vote(options: Array<any>) {
    const params = ['post', this.submitterId, ...options]
    return this.marketService.call('vote', params);
  }

  // get current vote details.
  get(proposalHash: string) {
    const params = ['get', this.submitterId, proposalHash];
    return this.marketService.call('vote', params)
    .pipe(map((v) => new VoteDetails(v)));
  }
}
