import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Log } from 'ng2-logger';
import { Observable } from 'rxjs/Observable';
import {
  ProposalConfirmationComponent
} from 'app/modals/proposal-confirmation/proposal-confirmation.component';
import { FormArray } from '@angular/forms/src/model';

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
      options     : this.formBuilder.array([
         this.initTechnologyFields(),
         this.initTechnologyFields()
      ])
   });


    this.infoFormGroup = this.formBuilder.group({
      nickname:                      ['', [Validators.required,
                                        Validators.maxLength(50)]],
      email:                ['', [Validators.required,
                                        Validators.maxLength(50)]]
    });
  }

  initTechnologyFields(): FormGroup {
    return this.formBuilder.group({
      option : ['', Validators.compose([Validators.required, Validators.maxLength(50)])]
    });
  }

  /**
   * Programmatically generates a new technology input field
   *
   * @public
   * @method addNewInputField
   * @return {none}
   */
  addNewInputField(): void {
    const control = <FormArray>this.voteFormGroup.controls.options;
    control.push(this.initTechnologyFields());
  }


  /**
   * Programmatically removes a recently generated technology input field
   *
   * @public
   * @method removeInputField
   * @param i    {number}      The position of the object in the array that needs to removed
   * @return {none}
   */
  removeInputField(i: number): void {
    const control = <FormArray>this.voteFormGroup.controls.options;
    control.removeAt(i);
  }

  cancelAndDiscard() {
    this.router.navigate(['/wallet/proposals']);
  }

  submitProposal() {
    this.dialog.open(ProposalConfirmationComponent);
  }

}
