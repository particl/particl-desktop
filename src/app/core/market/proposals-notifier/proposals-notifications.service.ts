import { Injectable, OnDestroy, Inject, forwardRef } from '@angular/core';
import { Log } from 'ng2-logger';
import * as _ from 'lodash';

import { ProposalsService } from 'app/wallet/proposals/proposals.service';
import { PeerService } from 'app/core/rpc/peer/peer.service';
import { NotificationService } from 'app/core/notification/notification.service';
import { Proposal } from 'app/wallet/proposals/models/proposal.model';
import { take, takeWhile } from 'rxjs/operators';

@Injectable()
export class ProposalsNotificationsService implements OnDestroy {

  log: any = Log.create('proposals-notifier.service id:' + Math.floor((Math.random() * 1000) + 1));
  public destroyed: boolean = false;
  private numNewProposals: number = 0;
  private lastUpdatedTimeStamp: number = 0;
  private notifcationTimestamp: number = 0;
  private lastKnownBlockCount: number = 0;
  private canUpdateProposalCount: boolean = true;
  private storageKeys: any = {
    timestamp_view_proposals: 'timestamp_view_proposals',
    timestamp_notifcation: 'timestamp_notifcation'
  };

  constructor(
    private proposalsService: ProposalsService,
    private peerService: PeerService,
    private _notification: NotificationService,
  ) {
    this.log.d('creating service');

    // load stored proposal.
    this.loadLastViewedProposalTimestamp();
    this.peerService
      .getBlockCount()
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe((blockCount: number) => {
        if (blockCount !== this.lastKnownBlockCount) {
          this.lastKnownBlockCount = blockCount;
          if (this.canUpdateProposalCount) {
            this.loadProposals();
          }
        }
      });
  }

  get proposalsCountRequiredVoteAction(): number {
    return this.numNewProposals;
  }

  loadProposals(): void {
    this.proposalsService
      .list(this.lastUpdatedTimeStamp, '*')
      .pipe(take(1))
      .subscribe((proposals: Proposal[]) => {
        let tempCount = 0;
        if (proposals.length) {
          for (let idx = proposals.length - 1; idx >= 0; idx--) {
            const proposal: Proposal = proposals[idx];
            if (proposal && (+proposal.createdAt > this.lastUpdatedTimeStamp)) {
              tempCount++;
            }
          }
          if (tempCount > 0) {
            let needUpdating = false;
            for (let idx = proposals.length - tempCount; idx < proposals.length; idx++) {
              const proposal: Proposal = proposals[idx];
              if (proposal && +proposal.createdAt > this.notifcationTimestamp) {
                needUpdating = true;
                this.notifyNewProposal(proposal);
              }
            }
            if (needUpdating) {
              this.notifcationTimestamp = Date.now();

              // restrict the notification for the unseen proposal at time time of GUI started.
              localStorage.setItem(this.storageKeys.timestamp_notifcation, String(this.notifcationTimestamp));
            }
          }
        }
        this.numNewProposals = tempCount;
      });
  }

  viewingProposals(canUpdateCount: boolean = true) {
    this.lastUpdatedTimeStamp = Date.now();
    this.numNewProposals = 0;
    this.canUpdateProposalCount = canUpdateCount;
    this.storeLastViewedProposalTimestamp();
  }

  loadLastViewedProposalTimestamp(): void {

    this.lastUpdatedTimeStamp = +(localStorage.getItem(this.storageKeys.timestamp_view_proposals) || 0);
    this.notifcationTimestamp = +(localStorage.getItem(this.storageKeys.timestamp_notifcation) || 0);
  }

  storeLastViewedProposalTimestamp(): void {
    localStorage.setItem(this.storageKeys.timestamp_view_proposals, String(this.lastUpdatedTimeStamp));
  }

  notifyNewProposal(proposal: Proposal): void {
    const message = `${proposal.title} newly arrived in you proposal list.`;
    this._notification.sendNotification(message);
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.log.d('stopping service');
  }
}
