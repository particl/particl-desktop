import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-proposals',
  templateUrl: './proposals.component.html',
  styleUrls: ['./proposals.component.scss']
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

  constructor(private router: Router, private formBuilder: FormBuilder) { }

  ngOnInit() {
    this.formBuild();
  }

  formBuild() {
    /*
    this.proposalsFormGroup = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: [''],
      country: ['', Validators.required],
      zipCode: ['', Validators.required],
      newShipping: [''],
      title: ['', Validators.required]
    });
    */
  }

  addProposal() {
    this.router.navigate(['/wallet/proposal']);
  }


  changeTab(index: number): void {
    this.selectedTab = index;
  }

}
