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
  itemFormGroup: FormGroup;

  constructor(private router: Router, private formBuilder: FormBuilder,
              private dialog: MatDialog
            ) { }

  ngOnInit() {
    this.itemFormGroup = this.formBuilder.group({
      title:                      ['', [Validators.required,
                                        Validators.maxLength(50)]],
      description:                ['', [Validators.required,
                                        Validators.maxLength(2000)]],
      /*category:                   ['', [Validators.required]],
      country:                    ['', [Validators.required]],
      basePrice:                  ['', [Validators.required, Validators.min(0)]],
      domesticShippingPrice:      ['', [Validators.required, Validators.min(0)]],
      internationalShippingPrice: ['', [Validators.required, Validators.min(0)]]*/
    });


  }

  cancelAndDiscard() {
    this.router.navigate(['/wallet/proposals']);
  }

  submitProposal() {
    this.dialog.open(ProposalConfirmationComponent);
  }

}
