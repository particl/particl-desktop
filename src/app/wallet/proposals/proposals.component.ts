import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import {
  ProposalVoteConfirmationComponent
} from 'app/modals/proposal-vote-confirmation/proposal-vote-confirmation.component';
import * as d3 from 'd3';

@Component({
  selector: 'app-proposals',
  templateUrl: './proposals.component.html',
  styleUrls: [
    './proposals.component.scss',
    '../../../../node_modules/nvd3/build/nv.d3.css'
  ]
})

export class ProposalsComponent implements OnInit {

  sortings: Array<any> = [
    { title: 'By date of creation',   value: 'created'    },
    { title: 'By time left',          value: 'time_left'  },
    { title: 'By number of votes',    value: 'votes'      },
  ];

  filterings: Array<any> = [
    { title: 'All proposals',     value: 'all'      },
    { title: 'Unvoted by you',    value: 'unvoted'  },
    { title: 'Voted by you',      value: 'voted'    },
  ];

  // FIXME: remove, just placeholder values for voting:
  votings: Array<any> = [
    { title: 'Yes',           value: 'yes'  },
    { title: 'No',            value: 'no'   },
    { title: 'Don\'t care..', value: 'meh'  },
  ];

  filters: any = {
    search:   undefined,
    filter:   undefined,
    sort:     undefined,
  };

  // FIXME: needs clean-up?
  public selectedTab: number = 0;
  public proposalsFormGroup: FormGroup;
  public tabLabels: Array<string> = ['active', 'past'];
  public options: any;
  public data: any;

  constructor(private router: Router, private formBuilder: FormBuilder,
              private dialog: MatDialog
            ) { }

  ngOnInit() {
    const chart = nv.models.pieChart();
    this.options = {
      chart: {
        type: 'pieChart',
        height: 250,
        width: 250,
        x: (d) => {return d.key; },
        y: (d) => {return d.y; },
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
    this.data = [
      { key: 'Yes', y: 4651813.18567841 },
      { key: 'Rather yes', y: 2624413.51774001 },
      { key: 'Rather no', y: 251813.18567841 },
      { key: 'No', y: 1624413.51774001 }
    ];
  }

  addProposal() {
    this.router.navigate(['/wallet/proposal']);
  }


  changeTab(index: number): void {
    this.selectedTab = index;
  }

  vote() {
    this.dialog.open(ProposalVoteConfirmationComponent);
  }

}
