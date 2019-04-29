import { Component, Input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';

import { RpcStateService } from 'app/core/core.module';

import { ProposalsService } from 'app/wallet/proposals/proposals.service';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';
import { ModalsHelperService } from 'app/modals/modals-helper.service';
import {
  ProposalVoteConfirmationComponent
} from 'app/modals/proposal-vote-confirmation/proposal-vote-confirmation.component';
import { ProcessingModalComponent } from 'app/modals/processing-modal/processing-modal.component';
import { VoteOption } from 'app/wallet/proposals/models/vote-option.model';
import { Proposal } from 'app/wallet/proposals/models/proposal.model';
import { ProposalResult } from 'app/wallet/proposals/models/proposal-result.model';
import { VoteDetails } from 'app/wallet/proposals/models/vote-details.model';
import { takeWhile } from 'rxjs/operators';
import { NvD3Component } from 'ng2-nvd3';

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
  @ViewChild('chart') chart: NvD3Component;
  @Input() proposal: Proposal;
  @Input() selectedTab: string;

  // pie chart config(s).
  public graphOptions: any = {
    chart: {
      type: 'pieChart',
      height: 250,
      width: 250,
      x: (d) => { return d.description; },
      y: (d) => { return d.weight; },
      showLabels: false,
      donut: true,
      legend: {
        maxKeyLength: 35,
        margin: {
          left: 200,
          right: 112,
          top: 5,
          bottom: 5
        },
        rightAlign: true
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
  btnValidate: boolean = false;
  private _balance: number;
  constructor(
    private _rpcState: RpcStateService,
    private dialog: MatDialog,
    private proposalService: ProposalsService,
    private snackbarService: SnackbarService,
    private modelsService: ModalsHelperService
  ) {}

  ngOnInit() {
    if (this.proposal) {
      this.getProposalResult();
    }
  }

  getVoteDetails(): void {
    this.proposalService.get(this.proposal.hash)
    .pipe(takeWhile(() => !this.destroyed))
    .subscribe((voteDetail: VoteDetails) => {
      this.voteDetails = voteDetail;
      this.aleradyVoted = true;
    }, (error) => {
      this.log.d(error)
    });
  }

  getProposalResult(): void {
    this.proposalService.result(this.proposal.hash)
      .pipe(takeWhile(() => !this.destroyed))
      .subscribe((result: ProposalResult) => {
        if (result) {
          this.proposalResult = result;

          // No need to call this.getVoteDetails() until proposal doesn't have any vote!!
          if (this.proposalResult.totalWeight) {
            this.getVoteDetails();
          }
        }
      });
  }

  vote(): void {
    this._balance = this._rpcState.get('getwalletinfo').total_balance;
    const previousVote = this.voteDetails ? this.voteDetails.ProposalOption : null;
    if (previousVote && previousVote.optionId === this.selectedOption.optionId) {
      this.snackbarService.open(
        `You already voted with option "${this.selectedOption.description}" for this proposal: ${this.proposal.title}.`,
        'info'
      );
      return;
    }

    if (!this._balance) {
      this.snackbarService.open(
        `You don't have sufficient balance in your wallet.`,
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
    this.modelsService.unlock({timeout: 30}, (status) => this.callVote())
  }

  callVote(): void {
    this.btnValidate = true;
    this.openProcessingModal();
    const params = [
      this.proposal.hash,
      this.selectedOption.optionId
    ];
    this.proposalService.vote(params).subscribe((response) => {
      this.btnValidate = false;
      this.aleradyVoted = true;
      this.dialog.closeAll();
      // Update graph data as votes are now saving locally
      this.getProposalResult();
      this.snackbarService.open(`Successfully voted for ${this.proposal.title}`, 'info');
    }, (error) => {
      this.btnValidate = false;
      this.dialog.closeAll();
      this.snackbarService.open(error, 'warn');
    })
  }

  openProcessingModal() {
      const dialog = this.dialog.open(ProcessingModalComponent, {
        disableClose: true,
        data: {
          message: 'Hang on, we are busy processing your vote'
        }
      });
  }

  ngOnDestroy() {
    if (this.chart) {
      try {
        // Fixes memory leak, re: https://github.com/krispo/ng2-nvd3/issues/80
        this.chart.clearElement();
      } catch (err) { }
    }
    this.destroyed = true;
  }

}
