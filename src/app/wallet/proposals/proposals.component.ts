import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { Log } from 'ng2-logger';
import * as _ from 'lodash';
import { PeerService } from 'app/core/rpc/peer/peer.service';
import { ProposalsService } from 'app/wallet/proposals/proposals.service';
import { Proposal } from 'app/wallet/proposals/models/proposal.model';
import { Observable } from 'rxjs/Observable';


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
  public sortedProposalByExpiryTime: Proposal[] = [];
  expiredProposalIds: number[];
  public isLoading: boolean = false;
  private destroyed: boolean;
  timer: any;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private peerService: PeerService,
    private proposalsService: ProposalsService
  ) { }

  ngOnInit() {
    this.peerService.getBlockCount()
    .takeWhile(() => !this.destroyed)
    .subscribe((count: number) => {

      if (this.tabLabels[this.selectedTab] === 'active') {
        this.loadActiveProposalsListing();
      }
    })
  }

  loadProposals(): void {
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
      .take(1)
      .subscribe((activeProposal: Proposal[]) => {
        this.isLoading = false;
        if (this.isNewProposalArrived(this.activeProposals, activeProposal)) {
          this.sortedProposalByExpiryTime = this.getSortedProposalByExpiryTime(activeProposal)
          this.activeProposals = activeProposal;
          this.setExpiryCheckTimer();
        }
      }, (error) => {
        this.isLoading = false;
        this.log.d(error);
      })
  }

  setExpiryCheckTimer(): void {

    // unsubscribe if timer already exist.
    if (this.timer) {
      this.timer.unsubscribe();
    }

    this.timer = Observable.interval(1000);
    this.timer
      .takeWhile(() => !this.destroyed)
      .subscribe(() => {
        this.removeExpiredProposals()
      }
    )
  }

  getSortedProposalByExpiryTime(proposals: Proposal[]): Proposal[] {

    // pick specific keys from the array of proposal for saving the memory consumption
    return _.map(
      _.orderBy(proposals, ['expiredAt'], ['desc']), (proposal) => _.pick(proposal, ['id', 'expiredAt'])
    ) ;
  }

  removeExpiredProposals(): void {
    if (
      this.sortedProposalByExpiryTime &&
      this.sortedProposalByExpiryTime.length
    ) {

      this.expiredProposalIds = [];
      for (let index = 0; index < this.sortedProposalByExpiryTime.length; index++) {

        if (this.sortedProposalByExpiryTime[index].expiredAt <= Date.now()) {

          this.expiredProposalIds.push(this.sortedProposalByExpiryTime[index].id)
        } else {
          break;
        }
      }

      if (this.expiredProposalIds.length) {
        this.activeProposals = _.filter(this.activeProposals, (proposal) => {
          return this.expiredProposalIds.indexOf(proposal.id) === -1;
        })
      }

    }

  }

  loadPastProposalsListing(): void {
    this.isLoading = true;
    this.proposalsService.list('*', Date.now())
      .take(1)
      .subscribe((pastProposal: Proposal[]) => {
        this.isLoading = false;
        this.pastProposals = pastProposal;
      }, (error) => {
        this.isLoading = false;
        this.log.d(error);
      })
  }

  isNewProposalArrived(oldProposals: Proposal[], newProposals: Proposal[]): boolean {
    return !oldProposals || (oldProposals.length !== newProposals.length)
  }

  addProposal(): void {
    this.router.navigate(['/wallet/proposal']);
  }

  changeTab(index: number): void {
    this.selectedTab = index;
    this.loadProposals();
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
