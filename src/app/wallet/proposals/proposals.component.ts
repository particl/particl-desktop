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

@Component({
  selector: 'app-proposals',
  templateUrl: './proposals.component.html',
  styleUrls: [
    './proposals.component.scss'
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

  filters: any = {
    search:   undefined,
    filter:   undefined,
    sort:     undefined,
  };

  // FIXME: needs clean-up?
  public selectedTab: number = 0;
  public tabLabels: Array<string> = ['active', 'past'];
  public address: string;
  public currentBlockCount: number;

  public proposals: Array<any> = [{
    'title': 'post 1 title',
    'submitter': 'submitter',
    'blockStart': 1,
    'blockEnd': 1,
      // tslint:disable-next-line
    'description': 'Twelve boys aged 11 to 17 and a 25-year-old man became stranded in Tham Luang Nang Non (Thai: ถ้ำหลวงนางนอน), a cave in Thailand\'s Chiang Rai Province, on 23 June 2018. Heavy rains partially flooded the cave during their visit. The boys – all members of a local association football team – and their assistant coach were reported missing a few hours later, and search operations began immediately. <br/> Efforts to locate them were hampered by rising water levels, and no contact was made for over a week. The rescue effort expanded into a massive operation amid intense worldwide media coverage and public interest.',
    'options': [
        {
            'optionId': 0,
            'description': 'option - 1'
        },
        {
            'optionId': 1,
            'description': 'option - 2'
        },
        {
            'optionId': 2,
            'description': 'option -3'
        }
    ],
    'type': 'PUBLIC_VOTE',
    'hash': '3928631d2c53450e6c7f207ce239dd29677dc50daaf21d574cec3e2d4c412b98'
  }, {
    'title': 'post 2 title',
    'submitter': 'submitter',
    'blockStart': 1,
    'blockEnd': 1,
    // tslint:disable-next-line
    'description': 'Twelve boys aged 11 to 17 and a 25-year-old man became stranded in Tham Luang Nang Non (Thai: ถ้ำหลวงนางนอน), a cave in Thailand\'s Chiang Rai Province, on 23 June 2018. Heavy rains partially flooded the cave during their visit. The boys – all members of a local association football team – and their assistant coach were reported missing a few hours later, and search operations began immediately.',
    'options': [
        {
            'optionId': 0,
            'description': 'option 1'
        },
        {
            'optionId': 1,
            'description': 'option 2'
        },
        {
            'optionId': 2,
            'description': 'option 3'
        }
    ],
    'type': 'PUBLIC_VOTE',
    'hash': '3928631d2c53450e6c7f207ce239ddsa677dc50daaf21d574cec3e2d4c412b98'
  }];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private profileService: ProfileService,
    private _rpc: RpcService,
    private peerService: PeerService,
    private blockStatusService: BlockStatusService
  ) { }

  ngOnInit() {
    // get default profile address.
    this.profileService.default().takeWhile(() => true).subscribe((profile: Profile) => {
      this.address = profile.address;
    });

    this.peerService.getBlockCount().subscribe((count: number) => {
      this.currentBlockCount = count;
    })
  }

  addProposal() {
    this.router.navigate(['/wallet/proposal']);
  }

  changeTab(index: number): void {
    this.selectedTab = index;
  }

}
