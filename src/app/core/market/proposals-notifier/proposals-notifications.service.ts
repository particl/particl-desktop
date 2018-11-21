import { Injectable, OnDestroy, Inject, forwardRef } from '@angular/core';
import { Log } from 'ng2-logger';
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
  public storedProposals: Proposal[] = [];
  public destroyed: boolean = false;
  private proposalsCountRequiredVoteActions: number = 0;
  private profile: Profile;

  get proposalsCountRequiredVoteAction(): number {
    return this.proposalsCountRequiredVoteActions;
  }

  constructor(
    private proposalsService: ProposalsService,
    private peerService: PeerService,
    private _notification: NotificationService,
    private profileService: ProfileService
  ) {

    // load stored proposal.
    this.loadstoredProposals();

    this.profileService.default()
      .takeWhile(() => !this.destroyed)
      .subscribe((profile: Profile) => {
        this.profile = profile;


        this.peerService
          .getBlockCount()
          .takeWhile(() => !this.destroyed)
          .subscribe((blockCount: number) => {
            // loadProposal() call in every 1 sec as BlockCount update every second in peer service.
            this.loadProposals(blockCount);
          });
      });
  }

  loadProposals(startBlockCount: number): void {
    this.proposalsService
      .list(startBlockCount, '*')
      .take(1)
      .subscribe((proposals: Proposal[]) => {
        proposals.reverse();
        if (this.proposals.length && this.proposals.length !== proposals.length) {
          this.checkProposals(proposals);
        }

        if (!this.storedProposals.length) {
          this.checkProposalsRequiredVoteActions(proposals);
        } else if (this.storedProposals.length !== proposals.length) {
          this.proposalsCountRequiredVoteActions = proposals.length - this.storedProposals.length;
        }
        this.proposals = proposals;
      });
  }

  // @TODO remove once functionality done from the MP side.
  loadstoredProposals(): void {
    this.storedProposals = JSON.parse(localStorage.getItem('proposals')) || [];
  }

  // @TODO remove once functionality done from the MP side.
  storeProposals(): void {
    if (this.proposals.length) {
      this.proposalsCountRequiredVoteActions = 0;
      this.storedProposals = this.proposals;
      localStorage.setItem('proposals', JSON.stringify(this.proposals));
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
    this.getProposalsToNotifyFor(proposals).filter((proposal) => {
      return proposal.submitter !== this.profile.address;
    }).forEach(proposal => {
      this.notifyNewProposal(proposal);
    })
  }

  getProposalsToNotifyFor(newProposals: Proposal[]): Proposal[] {
    return _.differenceWith(newProposals, this.proposals, (p1, p2) => {
      return p1.id === p2.id;
    });
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
