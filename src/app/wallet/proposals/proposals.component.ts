import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Log } from 'ng2-logger';
import * as _ from 'lodash';
import { PeerService } from 'app/core/rpc/peer/peer.service';
import { ProposalsService } from 'app/wallet/proposals/proposals.service';
import { Proposal } from 'app/wallet/proposals/models/proposal.model';
import { Observable, timer } from 'rxjs';
import { ProposalsNotificationsService } from 'app/core/market/proposals-notifier/proposals-notifications.service';
import { takeWhile, take, throttleTime } from 'rxjs/operators';

@Component({
  selector: 'app-proposals',
  templateUrl: './proposals.component.html',
  styleUrls: [
    './proposals.component.scss'
  ]
})

export class ProposalsComponent implements OnInit, OnDestroy {

  log: any = Log.create('proposal.component');

  sortings: Array<any> = [
    { title: 'By date of creation', value: 'created' },
    { title: 'By time left', value: 'time_left' },
    { title: 'By number of votes', value: 'votes' },
  ];

  filterings: Array<any> = [
    { title: 'All proposals', value: 'all' },
    { title: 'Unvoted by you', value: 'unvoted' },
    { title: 'Voted by you', value: 'voted' },
  ];

  filters: any = {
    search: undefined,
    filter: undefined,
    sort: undefined,
  };

  // FIXME: needs clean-up?
  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['active', 'past'];
  // ['active', 'planned', 'past']
  public proposals: Proposal[] = [];
  public activeProposals: Proposal[] = [];
  public pastProposals: Proposal[] = [];
  public isLoading: boolean = false;
  private destroyed: boolean;
  private timer: any;
  private sortedProposalByExpiryTime: any[] = [];

  constructor(
    private router: Router,
    private peerService: PeerService,
    private proposalsService: ProposalsService,
    private proposalsNotificationsService: ProposalsNotificationsService
  ) {
    // update last proposal timestamp.
    this.proposalsNotificationsService.viewingProposals(false);
  }

  ngOnInit() {

    this.peerService.getBlockCount()
    .pipe(takeWhile(() => !this.destroyed)).pipe(throttleTime(60000))
    .subscribe((count: number) => {

      if (this.tabLabels[this.selectedTab] === 'active') {
        this.loadActiveProposalsListing();
      }
    })
  }

  loadProposals(): void {
    this.clearStores();
    if (this.tabLabels[this.selectedTab] === 'active') {
      // get active proposal list
      this.loadActiveProposalsListing();
    } else {
      // get past proposal list
      this.loadPastProposalsListing();
    }
  }

  loadActiveProposalsListing(): void {
    this.isLoading = true;
    this.proposalsService.list(Date.now(), '*')
      .pipe(take(1))
      .subscribe((activeProposalList: Proposal[]) => {
        this.isLoading = false;
        if (
          this.isNewProposalArrived(this.activeProposals, activeProposalList) ||
          this.isProposalExpiryAtArrived(this.activeProposals, activeProposalList)
        ) {
          this.activeProposals = activeProposalList.reverse();
          this.sortedProposalByExpiryTime = this.getSortedProposalByExpiryTime(this.activeProposals);
          this.setExpiryCheckTimer();
        }
      }, (error) => {
        this.isLoading = false;
        this.log.d(error);
      })
  }

  setExpiryCheckTimer(): void {

    this.stopTimer();

    this.timer = timer(1000, 1000)
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe(() => {
        this.removeExpiredProposals();
        }
      )
  }

  getSortedProposalByExpiryTime(proposals: Proposal[]): any[] {

    // pick specific keys from the array of proposal for saving the memory consumption
    const sortedProposals = proposals.map((proposal: Proposal, pIdx: number) => {
        return { 'idx': pIdx, expiredAt: proposal.expiredAt };
      });

    return _.orderBy(sortedProposals, ['expiredAt'], ['asc']);
  }

  removeExpiredProposals(): void {
    if (this.sortedProposalByExpiryTime.length) {
      const now = Date.now();

      let index = 0;
      for (; index < this.sortedProposalByExpiryTime.length; index++) {
        if (this.isLoading) {
          break;
        }

        if (this.sortedProposalByExpiryTime[index].expiredAt <= now) {
          const idx = this.sortedProposalByExpiryTime[index].idx;
          if (typeof idx === 'number' && this.activeProposals[idx]) {
            this.activeProposals.splice(idx, 1);
          }
        } else {
          break;
        }
      }

      if (index > 0) {
        this.sortedProposalByExpiryTime.splice(0, index + 1);
      }
    }

  }

  loadPastProposalsListing(): void {
    this.isLoading = true;
    this.proposalsService.list('*', Date.now())
      .pipe(take(1))
      .subscribe((pastProposal: Proposal[]) => {
        this.isLoading = false;
        this.pastProposals = pastProposal;
      }, (error) => {
        this.isLoading = false;
        this.log.d(error);
      });
  }

  isProposalExpiryAtArrived(oldProposals: Proposal[], newProposals: Proposal[]): boolean {
    return _.differenceWith(oldProposals, newProposals, (o1: Proposal, o2: Proposal) => {
      return (o1.id === o2.id) && (o1.isExpiredAtValid === o2.isExpiredAtValid)
    }).length !== 0;
  }

  isNewProposalArrived(oldProposals: Proposal[], newProposals: Proposal[]): boolean {
    return !oldProposals || (oldProposals.length !== newProposals.length)
  }

  addProposal(): void {
    this.router.navigate(['/wallet/main/wallet/proposal']);
  }

  changeTab(index: number): void {
    this.selectedTab = index;
    this.stopTimer();
    this.loadProposals();
  }

  ngOnDestroy() {
    this.proposalsNotificationsService.viewingProposals(true);
    this.destroyed = true;
  }

  private stopTimer() {
    try {
      if (this.timer !== undefined) {
        this.timer.unsubscribe();
      }
    } catch (e) {
      this.log.e('Failed to stop the expiry timer: ', e);
    }
  }

  private clearStores() {
    this.proposals = [];
    this.activeProposals = [];
    this.pastProposals = [];
    this.sortedProposalByExpiryTime = [];
  }

}
