import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import * as d3 from 'd3';

import { ProposalVoteConfirmationComponent } from 'app/modals/proposal-vote-confirmation/proposal-vote-confirmation.component';
import { ProposalsService } from 'app/wallet/proposals/proposals.service';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';
import { VoteOption } from 'app/wallet/proposals/models/vote-option';
import { ModalsHelperService } from 'app/modals/modals-helper.service';
import { Proposal } from 'app/wallet/proposals/models/proposal';

@Component({
  selector: 'app-proposal-details',
  templateUrl: './proposal-details.component.html',
  styleUrls: [
    './proposal-details.component.scss',
    '../../../../../node_modules/nvd3/build/nv.d3.css'
  ]
})
export class ProposalDetailsComponent implements OnInit {
  @Input() proposal: Proposal;
  @Input() selectedTab: string;
  @Input() submitterProfileId: number;
  @Input() currentBlockCount: number;

  public graphOptions: any;
  public graphData: any;
  public selectedOption: VoteOption;

  constructor(
    private dialog: MatDialog,
    private proposalService: ProposalsService,
    private snackbarService: SnackbarService,
    private modelsService: ModalsHelperService
  ) { }

  ngOnInit() {
    this.graphOptions = {
      chart: {
        type: 'pieChart',
        height: 250,
        width: 250,
        x: (d) => { return d.key; },
        y: (d) => { return d.y; },
        showLabels: false,
        donut: true,
        legend: {
          margin: {
            top: 5,
            right: 35,
            bottom: 5,
            left: 0
          }
        },
        color: ['#02E8B0', '#ec4b50', '#108cda', '#f1cc00', '#7e6c95'], // green, red, blue, yellow, violet
        tooltip: {
          enabled: true,
          hideDelay: 0,
          useInteractiveGuideline: false
        }
      }
    }
    this.graphData = [
      { key: 'Yes', y: 4651813.18567841 },
      { key: 'Rather yes', y: 2624413.51774001 },
      { key: 'Rather no', y: 251813.18567841 },
      { key: 'No', y: 1624413.51774001 }
    ];
  }

  vote() {
    const dialog = this.dialog.open(ProposalVoteConfirmationComponent);
    dialog.componentInstance.setData({
      ... this.proposal,
      selectedOption: this.selectedOption
    }, () => this.vateConfirmed())
  }
  vateConfirmed(): void {
    this.modelsService.unlock({}, (status) => this.callVote())

  }

  callVote(): void {
      const params = [
        this.submitterProfileId,
        this.proposal.hash,
        this.selectedOption.optionId
      ];

      this.proposalService.vote(params).subscribe((response) => {
        this.snackbarService.open(`Successfully Vote for ${this.proposal.title}`, 'info');
      }, (error) => {
        this.snackbarService.open(error.message, 'warn');
      })
  }
}
