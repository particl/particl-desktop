import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Log } from 'ng2-logger';
import { Observable } from 'rxjs/Observable';
import {
  ProposalConfirmationComponent
} from 'app/modals/proposal-confirmation/proposal-confirmation.component';

@Component({
  selector: 'app-add-proposal',
  templateUrl: './add-proposal.component.html',
  styleUrls: ['./add-proposal.component.scss']
})
export class AddProposalComponent implements OnInit {

  log: any = Log.create('add-item.component');
  private destroyed: boolean = false;
  detailFormGroup: FormGroup;
  voteFormGroup: FormGroup;
  infoFormGroup: FormGroup;

  constructor(private router: Router, private formBuilder: FormBuilder,
              private dialog: MatDialog
            ) { }

  ngOnInit() {
    this.detailFormGroup = this.formBuilder.group({
      title:                      ['', [Validators.required,
                                        Validators.maxLength(50)]],
      description:                ['', [Validators.required,
                                        Validators.maxLength(2000)]]
    });

    this.voteFormGroup = this.formBuilder.group({
      option1:                      ['', [Validators.required,
                                        Validators.maxLength(50)]],
      option2:                ['', [Validators.required,
                                        Validators.maxLength(50)]],
      option3:                ['', [Validators.required,
                                        Validators.maxLength(50)]]
    });

    this.infoFormGroup = this.formBuilder.group({
      nickname:                      ['', [Validators.required,
                                        Validators.maxLength(50)]],
      email:                ['', [Validators.required,
                                        Validators.maxLength(50)]]
    });
  }

  cancelAndDiscard() {
    this.router.navigate(['/wallet/proposals']);
  }

  submitProposal() {
    this.dialog.open(ProposalConfirmationComponent);
  }

}
