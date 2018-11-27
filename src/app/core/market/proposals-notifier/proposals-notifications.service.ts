import { Injectable, OnDestroy, Inject, forwardRef } from '@angular/core';
import { Log } from 'ng2-logger';
import { Router } from '@angular/router';
import * as _ from 'lodash';

import { ProposalsService } from 'app/wallet/proposals/proposals.service';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { PeerService } from 'app/core/rpc/peer/peer.service';
import { NotificationService } from 'app/core/notification/notification.service';
import { Profile } from 'app/core/market/api/profile/profile.model';
import { Proposal } from 'app/wallet/proposals/models/proposal.model';

@Injectable()
export class ProposalsNotificationsService implements OnDestroy {

  log: any = Log.create('order-status-notifier.service id:' + Math.floor((Math.random() * 1000) + 1));
  public proposals: Proposal[] = [];
  public destroyed: boolean = false;
  private proposalsCountRequiredVoteActions: number = 0;
  private profile: Profile;
  private lastProposalTimeStamp: Number;

  get proposalsCountRequiredVoteAction(): number {
    return this.proposalsCountRequiredVoteActions;
  }

  constructor(
    private proposalsService: ProposalsService,
    private peerService: PeerService,
    private _notification: NotificationService,
    private profileService: ProfileService,
    private router: Router
  ) {

    // load stored proposal.
    this.loadLastProposalTimeStamp();

    this.profileService.default()
      .takeWhile(() => !this.destroyed)
      .subscribe((profile: Profile) => {
        this.profile = profile;


        this.peerService
          .getBlockCount()
          .takeWhile(() => !this.destroyed)
          .subscribe((blockCount: number) => {
            // loadProposal() call in every 1 sec as BlockCount update every second in peer service.
            this.loadProposals();
          });
      });
  }

  loadProposals(): void {
    console.log('route', this.router.url);
    this.proposalsService
      .list(Date.now(), '*')
      .take(1)
      .subscribe((proposals: Proposal[]) => {

        if (this.proposals.length && this.proposals.length !== proposals.length) {
          this.checkProposals(proposals);
        }

        proposals = this.getSortedProposalsByTime(proposals);


        // No need to update the notification count if user on the proposal page?
        if (this.router.url !== '/wallet/proposals') {

          if (this.lastProposalTimeStamp && proposals.length && proposals[0].createdAt !== this.lastProposalTimeStamp) {
            this.proposalsCountRequiredVoteActions = 0;
            for (const proposal of proposals) {
              if (proposal.createdAt !== this.lastProposalTimeStamp) {
                this.proposalsCountRequiredVoteActions += 1;
              } else {
                break;
              }
            }
          } else if (!this.lastProposalTimeStamp) {
            this.checkProposalsRequiredVoteActions(proposals);
          }
        }

        if (!this.lastProposalTimeStamp) {
          this.lastProposalTimeStamp = proposals[0].createdAt;
        }

        this.proposals = proposals;
      });
  }

  getSortedProposalsByTime(proposals: Proposal[]): Proposal[] {
    return _.orderBy(proposals, ['createdAt'], ['desc']);
  }

  // @TODO remove once functionality done from the MP side.
  loadLastProposalTimeStamp(): void {
    this.lastProposalTimeStamp = JSON.parse(localStorage.getItem('lastProposalTimeStamp'));
  }

  // @TODO remove once functionality done from the MP side.
  storeProposals(): void {
    if (this.proposals.length) {
      this.proposalsCountRequiredVoteActions = 0;
      this.lastProposalTimeStamp = this.proposals[0].createdAt;
      localStorage.setItem('lastProposalTimeStamp', JSON.stringify(this.proposals[0].createdAt));
    }
  }

  checkProposalsRequiredVoteActions(proposals: Proposal[]): void {
    this.proposalsCountRequiredVoteActions = 0;
    proposals.map((proposal: Proposal) => {
      // get user vote status.

      this.proposalsService.get(proposal.hash)
        .take(1).subscribe((result) => { }, (message) => {
          // proposal has no vote count yet.
          if (message === 'User has not voted for that Proposal yet.') {
            this.proposalsCountRequiredVoteActions += 1;
          }
        })
    })
  }

  checkProposals(proposals: Proposal[]): void {
    this.getProposalsToNotifyFor(proposals, this.proposals).filter((proposal) => {
      return proposal.submitter !== this.profile.address;
    }).forEach(proposal => {
      this.notifyNewProposal(proposal);
    })
  }

  getProposalsToNotifyFor(newProposals: Proposal[], oldProposals: Proposal[]): Proposal[] {
    return _.differenceWith(newProposals, oldProposals, (p1, p2) => {
      return p1.id === p2.id;
    })
  }

  notifyNewProposal(proposal: Proposal): void {
    const message = `${proposal.title} newly arrivied in you proposal list.`;
    this._notification.sendNotification(message);
  }

  votedForProposal() {
    if (this.proposalsCountRequiredVoteActions) {
      this.proposalsCountRequiredVoteActions -= 1
    }
  }


  ngOnDestroy() {
    this.destroyed = true;
  }
}
