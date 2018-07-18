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
        height: 300,
        width: 300,
        x: (d) => {return d.key; },
        y: (d) => {return d.y; },
        showLabels: true,
        duration: 5,
        labelThreshold: 0.01,
        labelSunbeamLayout: true,
        legend: {
            margin: {
                top: 5,
                right: 35,
                bottom: 5,
                left: 0
            }
        },
        tooltip: {
          enabled: true,
          useInteractiveGuideline: false,
          contentGenerator: (e) => {
            const series = e.series[0];
            if (series.value === null) { return; }

            const rows =
              '<tr>' +
                '<td class=\'key\'>' + 'Value: ' + '</td>' +
                '<td class=\'x-value\'><strong>' + (series.value ? series.value.toFixed(2) : 0) + '</strong></td>' +
              '</tr>';

            const header =
              '<thead>' +
                '<tr>' +
                  '<td class=\'legend-color-guide\'><div style=\'background-color: ' + series.color + ';\'></div></td>' +
                  '<td class=\'key\'><strong>' + series.key + '</strong></td>' +
                '</tr>' +
              '</thead>';

            return '<table>' +
                header +
                '<tbody>' +
                  rows +
                '</tbody>' +
              '</table>';
          },
          position:  () => {
            console.log('d3', d3);
            const data = {
              left: d3.event !== null ? d3.event['clientX'] : 0,
              top: d3.event !== null ? d3.event['clientY'] : 0
            }
            console.log('data', data)
            return data;
        }
        }
      }
    }
    this.data = [
      { key: 'One', y: 5 },
      { key: 'Two', y: 2 },
      { key: 'Three', y: 9 },
      { key: 'Four', y: 7 }
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
