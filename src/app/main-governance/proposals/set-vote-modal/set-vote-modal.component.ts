import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { isBasicObjectType, getValueOrDefault } from 'app/main-governance/utils';


enum TextContent {
  LABEL_OPTION_0 = 'Abstain from vote',
  LABEL_OPTION_1 = 'Option 1',
  LABEL_OPTION_2 = 'Option 2',
}


export interface ProposalModalData {
  proposalTitle: string;
  proposalId: number;
  existingVote: number | null;
}


@Component({
  templateUrl: './set-vote-modal.component.html',
  styleUrls: ['./set-vote-modal.component.scss']
})
export class SetVoteModalComponent {

  readonly voteOptions: {value: number; label: string}[] = [
    {value: 0, label: TextContent.LABEL_OPTION_0},
    {value: 1, label: TextContent.LABEL_OPTION_1},
    {value: 2, label: TextContent.LABEL_OPTION_2}
  ];

  readonly proposalForm: FormGroup;
  readonly proposalName: string = '';
  readonly proposalId: string = '';
  readonly initVoteValue: number;


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: ProposalModalData,
    private _dialogRef: MatDialogRef<SetVoteModalComponent>,
  ) {

    let defaultVoteToCast = -1;


    if (isBasicObjectType(this.data)) {
      this.proposalName = getValueOrDefault(this.data.proposalTitle, 'string', this.proposalName);
      this.proposalId = +this.data.proposalId > 0 ? `${+this.data.proposalId}` : this.proposalId;

      if ((typeof this.data.existingVote === 'number') && (this.voteOptions.findIndex(vo => vo.value === this.data.existingVote) > -1)) {
        defaultVoteToCast = this.data.existingVote;
      }
    }
    this.initVoteValue = defaultVoteToCast;

    this.proposalForm = new FormGroup({
      voteToCast: new FormControl(this.initVoteValue, [Validators.required, Validators.min(0), Validators.max(2)]),
    });

    // temporary measure: clearing a vote in core doesn't appear to remove the vote...
    //  so skipping the abstain vote if a vote has already been cast
    if (this.initVoteValue > 0) {
      this.voteOptions.splice(0, 1);
    }
  }

  get formControlVoteToCast(): AbstractControl {
    return this.proposalForm.get('voteToCast');
  }


  doAction(): void {
    if (!this.proposalForm.valid || this.proposalForm.disabled) {
      return;
    }
    this.proposalForm.disable();
    let finalValue = null;
    const voteToCast = +this.formControlVoteToCast.value;
    if (voteToCast >= 0) {
      finalValue = voteToCast;
    }
    this._dialogRef.close(finalValue);
  }

}
