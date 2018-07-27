import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { Profile } from 'app/core/market/api/profile/profile.model';
import { RpcService } from 'app/core/rpc/rpc.service';
import { PeerService } from 'app/core/rpc/peer/peer.service';
import { BlockStatusService } from 'app/core/rpc/blockstatus/blockstatus.service';
import { ProposalsService } from 'app/wallet/proposals/proposals.service';
import { Proposal } from 'app/wallet/proposals/models/proposal';

@Component({
  selector: 'app-proposals',
  templateUrl: './proposals.component.html',
  styleUrls: [
    './proposals.component.scss'
  ]
})

export class ProposalsComponent implements OnInit {

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
  public tabLabels: Array<string> = ['active', 'planned', 'past'];
  public address: string;
  public currentBlockCount: number;
  public proposals: Proposal[];
  public activeProposals: Proposal[] = [];
  public pastProposals: Proposal[] = [];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private _rpc: RpcService,
    private peerService: PeerService,
    private blockStatusService: BlockStatusService,
    private proposalsService: ProposalsService
  ) { }

  ngOnInit() {

    //  sample data.
    this.proposals = [{
      title: 'post 1 title',
      submitter: 'submitter',
      blockStart: 124,
      blockEnd: 204065,
      // tslint:disable-next-line
      description: 'Twelve boys aged 11 to 17 and a 25-year-old man became stranded in Tham Luang Nang Non (Thai: ถ้ำหลวงนางนอน), a cave in Thailand\'s Chiang Rai Province, on 23 June 2018. Heavy rains partially flooded the cave during their visit. The boys – all members of a local association football team – and their assistant coach were reported missing a few hours later, and search operations began immediately. <br/> Efforts to locate them were hampered by rising water levels, and no contact was made for over a week. The rescue effort expanded into a massive operation amid intense worldwide media coverage and public interest.',
      options: [
        {
          optionId: 0,
          description: 'option - 1'
        },
        {
          optionId: 1,
          description: 'option - 2'
        },
        {
          optionId: 2,
          description: 'option -3'
        }
      ],
      type: 'PUBLIC_VOTE',
      hash: '3928631d2c53450e6c7f207ce239dd29677dc50daaf21d574cec3e2d4c412b98'
    }, {
      title: 'post 2 title',
      submitter: 'submitter',
      blockStart: 1247,
      blockEnd: 205831,
      // tslint:disable-next-line
      description: 'Twelve boys aged 11 to 17 and a 25-year-old man became stranded in Tham Luang Nang Non (Thai: ถ้ำหลวงนางนอน), a cave in Thailand\'s Chiang Rai Province, on 23 June 2018. Heavy rains partially flooded the cave during their visit. The boys – all members of a local association football team – and their assistant coach were reported missing a few hours later, and search operations began immediately.',
      options: [
        {
          optionId: 0,
          description: 'option 1'
        },
        {
          optionId: 1,
          description: 'option 2'
        },
        {
          optionId: 2,
          description: 'option 3'
        }
      ],
      type: 'PUBLIC_VOTE',
      hash: '3928631d2c53450e6c7f207ce239ddsa677dc50daaf21d574cec3e2d4c412b98'
    }, {
      title: 'post 2 title',
      submitter: 'submitter',
      blockStart: 1247,
      blockEnd: 204150,
      // tslint:disable-next-line
      description: 'Twelve boys aged 11 to 17 and a 25-year-old man became stranded in Tham Luang Nang Non (Thai: ถ้ำหลวงนางนอน), a cave in Thailand\'s Chiang Rai Province, on 23 June 2018. Heavy rains partially flooded the cave during their visit. The boys – all members of a local association football team – and their assistant coach were reported missing a few hours later, and search operations began immediately.',
      options: [
        {
          optionId: 0,
          description: 'option 1'
        },
        {
          optionId: 1,
          description: 'option 2'
        },
        {
          optionId: 2,
          description: 'option 3'
        }
      ],
      type: 'PUBLIC_VOTE',
      hash: '3928631d2c53450e6c7f207ce239ddsa677dc50daaf21d574cec3e2d4c412b98'
    }, {
      title: 'Planned feature',
      submitter: 'submitter',
      blockStart: 12462527,
      blockEnd: 12485125,
      // tslint:disable-next-line
      description: 'Twelve boys aged 11 to 17 and a 25-year-old man became stranded in Tham Luang Nang Non (Thai: ถ้ำหลวงนางนอน), a cave in Thailand\'s Chiang Rai Province, on 23 June 2018. Heavy rains partially flooded the cave during their visit. The boys – all members of a local association football team – and their assistant coach were reported missing a few hours later, and search operations began immediately.',
      options: [
        {
          optionId: 0,
          description: 'option 1'
        },
        {
          optionId: 1,
          description: 'option 2'
        },
        {
          optionId: 2,
          description: 'option 3'
        }
      ],
      type: 'PUBLIC_VOTE',
      hash: '3928631d2c53450e6c7f207ce239ddsa677dc50daaf21d574cec3e2d4c412b98'
    }].map(v => new Proposal(v))

    // get default profile address.
    this.profileService.default().take(1).subscribe((profile: Profile) => {
      this.address = profile.address;
    });


    // get current BlockCounts
    this.peerService.getBlockCount().subscribe((count: number) => {
      this.currentBlockCount = count;
      this.filterProposal();
    })

    // get proposal list

    // this.getProposalsListing();
  }

  // getProposalsListing() {
  //   this.proposalsService.list().subscribe((proposals: Proposal[]) => {
  //     this.proposals = proposals;
  //     this.filterProposal();
  //   })
  // }

  filterProposal(): void {
    this.activeProposals = [];
    this.pastProposals = [];

    this.proposals.map(proposal => {
      if (proposal.isActiveProposal(this.currentBlockCount)) {
        this.activeProposals.push(proposal)
      } else {
        this.pastProposals.push(proposal)
      }
    })
  }

  addProposal() {
    this.router.navigate(['/wallet/proposal']);
  }

  changeTab(index: number): void {
    this.selectedTab = index;
  }

}
