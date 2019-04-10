import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Log } from 'ng2-logger';

import { FormArray } from '@angular/forms/src/model';
import { ProposalsService } from 'app/wallet/proposals/proposals.service';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';

import {
  ProposalConfirmationComponent
} from 'app/modals/proposal-confirmation/proposal-confirmation.component';
import { ModalsHelperService } from 'app/modals/modals-helper.service';
import { Amount } from 'app/core/util/utils';

@Component({
  selector: 'app-add-proposal',
  templateUrl: './add-proposal.component.html',
  styleUrls: ['./add-proposal.component.scss']
})
export class AddProposalComponent implements OnInit {

  log: any = Log.create('add-item.component');
  private destroyed: boolean = false;
  public isTnCAccepted: boolean = false;
  // form controls
  public proposalFormGroup: FormGroup;
  expireIn: number = 2; // days.

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private modalService: ModalsHelperService,
    private proposalsService: ProposalsService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit() {

    this.proposalFormGroup = this.formBuilder.group({
      title: ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      description: ['', Validators.compose([Validators.required, Validators.maxLength(2000)])],
      options: this.formBuilder.array([
        this.initOptionFields(),
        this.initOptionFields()
      ]),

      // @TODO `nickname` and `email` use in the "Contact Information" section.
      // nickname: ['', Validators.compose([Validators.maxLength(50)])],
      // email: ['',  Validators.compose([Validators.maxLength(150)])]
    });

  }

  initOptionFields(): FormGroup {
    return this.formBuilder.group({
      option: ['', Validators.compose([Validators.required, Validators.maxLength(50)])]
    });
  }

  /**
   * Programmatically generates a new option input field
   *
   * @public
   * @method addNewInputField
   * @return {none}
   */
  addNewInputField(): void {
    const control = <FormArray>this.proposalFormGroup.controls.options;
    control.push(this.initOptionFields());
  }


  /**
   * Programmatically removes a recently generated option input field
   *
   * @public
   * @method removeInputField
   * @param i    {number}      The position of the object in the array that needs to removed
   * @return {none}
   */
  removeInputField(i: number): void {
    const control = <FormArray>this.proposalFormGroup.controls.options;
    control.removeAt(i);
  }

  backToProposals(): void {
    this.router.navigate(['/wallet/main/wallet/proposals']);
  }

  submitProposal(): void {
    // check wallet status (unlock if locked ?).
    this.modalService.unlock({timeout: 10}, () => this.proposalTransactionFeeCallback())
  }

  proposalTransactionFeeCallback(): void {
    const proposalOptions = this.proposalFormGroup.value.options.map(v => v.option);
    const params = [
      this.proposalFormGroup.value.title,
      this.proposalFormGroup.value.description,
      this.expireIn,
      true,
      ... proposalOptions
    ];

    this.proposalsService.post(params).subscribe((response) => {
      const proposalTransactionFee = new Amount(response.fee);
      const dialogRef = this.dialog.open(ProposalConfirmationComponent);

      dialogRef.componentInstance.setData({
        title: this.proposalFormGroup.value.title,
        proposalTransactionFee
      },
      () => this.addPost(proposalOptions)
      );
    }, (error) => {
      this.snackbarService.open(error, 'warn')
    })
  }

  addPost(proposalOptions: string[]): void {

    // check wallet status (unlock if locked ?).
    this.modalService.unlock({timeout: 10}, () => this.addPostCall(proposalOptions))
  }

  addPostCall(proposalOptions: string[]): void {
      // add proposal.

      this.proposalsService.post([
        this.proposalFormGroup.value.title,
        this.proposalFormGroup.value.description,
        this.expireIn,
        false,
        ... proposalOptions
      ]).subscribe((response) => {
        this.snackbarService.open(
          'Proposal posted successfully!',
          'info'
        );

        // redirect to proposals page.
        this.backToProposals();
      }, (error) => {
        this.snackbarService.open(error, 'warn')
      })
  }
}
