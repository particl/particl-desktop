import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import * as d3 from 'd3';
import { Log } from 'ng2-logger';

import {
  ProposalVoteConfirmationComponent
} from 'app/modals/proposal-vote-confirmation/proposal-vote-confirmation.component';
import { ProposalsService } from 'app/wallet/proposals/proposals.service';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';
import { VoteOption } from 'app/wallet/proposals/models/vote-option.model';
import { ModalsHelperService } from 'app/modals/modals-helper.service';
import { Proposal } from 'app/wallet/proposals/models/proposal.model';
import { ProposalResult } from 'app/wallet/proposals/models/proposal-result.model';
import { GraphOption } from 'app/wallet/proposals/models/proposal-result-graph-option.model';
import { VoteDetails } from 'app/wallet/proposals/models/vote-details.model';

@Component({
  selector: 'app-proposal-details',
  templateUrl: './proposal-details.component.html',
  styleUrls: [
    './proposal-details.component.scss',
    './../../../../assets/css/nvd3/nv.d3.css'
  ]
})
export class ProposalDetailsComponent implements OnInit, OnDestroy {
  log: any = Log.create('proposal.component');
  @Input() proposal: Proposal;
  @Input() selectedTab: string;
  @Input() currentBlockCount: number;

  // pie chart config(s).
  public graphOptions: any = {
    chart: {
      type: 'pieChart',
      height: 250,
      width: 250,
      x: (d) => { return d.description; },
      y: (d) => { return d.voters; },
      showLabels: false,
      donut: true,
      legend: {
        maxKeyLength: 35,
        margin: {
          left: 0,
          right: 0,
          top: 5,
          bottom: 5
        },
        padding: {
          top: 0,
          bottom: 0,
          right: 5,
          left: 5
        }
      },
      color: ['#02E8B0', '#ec4b50', '#108cda', '#f1cc00', '#7e6c95'], // green, red, blue, yellow, violet
      tooltip: {
        enabled: true,
        hideDelay: 0,
        useInteractiveGuideline: false
      }
    }
  };

  public selectedOption: VoteOption;
  public proposalResult: ProposalResult;
  public voteDetails: VoteDetails;
  public aleradyVoted: boolean = false
  destroyed: boolean = false;

  constructor(
    private dialog: MatDialog,
    private proposalService: ProposalsService,
    private snackbarService: SnackbarService,
    private modelsService: ModalsHelperService
  ) { }

  ngOnInit() {
    if (this.proposal) {
      this.getProposalResult();
    }
  }

  getVoteDetails(): void {
    this.proposalService.get(this.proposal.hash)
    .takeWhile(() => !this.destroyed)
    .subscribe((voteDetail: VoteDetails) => {
      this.voteDetails = voteDetail;
      this.aleradyVoted = true;
    }, (error) => {
      this.log.d(error)
    });
  }

  getProposalResult(): void {
    this.proposalService.result(this.proposal.hash)
      .takeWhile(() => !this.destroyed)
      .subscribe((result: ProposalResult) => {
        if (result) {
          this.proposalResult = result;

          // No need to call this.getVoteDetails() until proposal doesn't have any vote!!
          if (this.proposalResult.totalVotes) {
            this.getVoteDetails();
          }
        }
      });
  }

  vote(): void {
    const previousVote = this.voteDetails ? this.voteDetails.ProposalOption : null;
    if (previousVote && previousVote.optionId === this.selectedOption.optionId) {
      this.snackbarService.open(
        `You already voted with option "${this.selectedOption.description}" for this proposal: ${this.proposal.title}.`,
        'info'
      );
      return;
    }

    const dialog = this.dialog.open(ProposalVoteConfirmationComponent);
    dialog.componentInstance.setData({
      ... this.proposal,
      selectedOption: this.selectedOption
    }, () => this.vateConfirmed())
  }

  vateConfirmed(): void {
    this.modelsService.unlock({timeout: 10}, (status) => this.callVote())
  }

  callVote(): void {
    const params = [
      this.proposal.hash,
      this.selectedOption.optionId
    ];
    this.proposalService.vote(params).subscribe((response) => {

      this.aleradyVoted = true;
      // update graph data.
      this.updateGraphData();
      this.snackbarService.open(`Successfully Vote for ${this.proposal.title}`, 'info');
    }, (error) => {
      this.snackbarService.open(error, 'warn');
    })
  }

  updateGraphData(): void {

    const previousVote = this.voteDetails ? this.voteDetails.ProposalOption : null;
    this.proposalResult.updateVote(this.selectedOption, previousVote);
    this.voteDetails = new VoteDetails({
      ProposalOption: this.selectedOption
    });
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
