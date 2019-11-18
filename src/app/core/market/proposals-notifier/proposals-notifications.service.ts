import { Injectable, OnDestroy, Inject, forwardRef } from '@angular/core';
import { Log } from 'ng2-logger';
import * as _ from 'lodash';

import { ProposalsService } from 'app/wallet/proposals/proposals.service';
import { PeerService } from 'app/core/rpc/peer/peer.service';
import { NotificationService } from 'app/core/notification/notification.service';
import { Proposal } from 'app/wallet/proposals/models/proposal.model';
import { take, takeWhile } from 'rxjs/operators';
import { SettingsStateService } from 'app/settings/settings-state.service';

@Injectable()
export class ProposalsNotificationsService implements OnDestroy {

  log: any = Log.create('proposals-notifier.service id:' + Math.floor((Math.random() * 1000) + 1));
  public destroyed: boolean = false;
  private numNewProposals: number = 0;
  private lastUpdatedTimeStamp: number = 0;
  private notifcationTimestamp: number = 0;
  private lastKnownBlockCount: number = 0;
  private canUpdateProposalCount: boolean = true;
  private doNotify: boolean = true;
  private storageKeys: any = {
    timestamp_view_proposals: 'timestamp_view_proposals',
    timestamp_notifcation: 'timestamp_notifcation'
  };

  constructor(
    private proposalsService: ProposalsService,
    private peerService: PeerService,
    private _notification: NotificationService,
    private _settings: SettingsStateService
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

    this._settings.observe('settings.wallet.notifications.proposal_arrived').pipe(
      takeWhile(() => !this.destroyed)
    ).subscribe(
      (isSubscribed) => {
        this.doNotify = Boolean(+isSubscribed);
      }
    )
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
            const newIndexes: number[] = [];
            for (let idx = proposals.length - tempCount; idx < proposals.length; idx++) {
              const proposal: Proposal = proposals[idx];
              if (proposal && +proposal.createdAt > this.notifcationTimestamp) {
                newIndexes.push(idx);
              }
            }

            if (newIndexes.length) {
              if (this.doNotify) {
                let message = `${newIndexes.length} new proposals are available`;
                if (newIndexes.length === 1) {
                  const proposal: Proposal = proposals[newIndexes[0]];
                  message = `${proposal.title} newly arrived in you proposal list.`;
                }
                this.notifyNewProposal(message);
              }
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

  notifyNewProposal(message: string): void {
    if (!message.length) {
      return;
    }
    this._notification.sendNotification(message);
  }

  ngOnDestroy() {
    this.destroyed = true;
    this.log.d('stopping service');
  }
}
