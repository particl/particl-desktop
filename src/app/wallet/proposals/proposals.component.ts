import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Log } from 'ng2-logger';
import * as _ from 'lodash';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { Profile } from 'app/core/market/api/profile/profile.model';
import { RpcService } from 'app/core/rpc/rpc.service';
import { PeerService } from 'app/core/rpc/peer/peer.service';
import { BlockStatusService } from 'app/core/rpc/blockstatus/blockstatus.service';
import { ProposalsService } from 'app/wallet/proposals/proposals.service';
import { Proposal } from 'app/wallet/proposals/models/proposal.model';
import { Observable } from 'rxjs/Observable';
import { time } from 'd3';


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

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private peerService: PeerService,
    private blockStatusService: BlockStatusService,
    private proposalsService: ProposalsService
  ) { }

  ngOnInit() {

    // load proposal in every second
    const timer = Observable.interval(1000)
    timer.subscribe(() => this.loadProposals())
  }

  loadProposals(): void {
    console.log('--------79---', Date.now())
    this.isLoading = true;
    if (this.tabLabels[this.selectedTab] === 'active') {

      // get active proposal list
      this.getActiveProposalsListing();
    } else {

      // get past proposal list
      this.getPastProposalsListing();
    }
  }

  getActiveProposalsListing(): void {

    this.proposalsService.list(Date.now(), '*')
      .take(1)
      .subscribe((activeProposal: Proposal[]) => {
        this.isLoading = false;
        if (this.isNewProposalArrived(this.activeProposals, activeProposal)) {
          activeProposal.reverse()
          this.activeProposals = activeProposal;
        }
      }, (error) => {
        this.isLoading = false;
        this.log.d(error);
      })
  }

  getPastProposalsListing(): void {

    this.proposalsService.list('*', Date.now())
      .take(1)
      .subscribe((pastProposal: Proposal[]) => {
        this.isLoading = false;
        if (this.isNewProposalArrived(this.pastProposals, pastProposal)) {
          pastProposal.reverse()
          this.pastProposals = pastProposal;
        }
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
