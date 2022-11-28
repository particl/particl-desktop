import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';


export interface ChatParticipantRemoveConfirmationModalInputs {
  address: string;
  label: string;
}


@Component({
  templateUrl: './chat-participant-remove-confirmation-modal.component.html',
  styleUrls: ['./chat-participant-remove-confirmation-modal.component.scss']
})
export class ChatParticipantRemoveConfirmationModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ChatParticipantRemoveConfirmationModalInputs,
    private _dialogRef: MatDialogRef<ChatParticipantRemoveConfirmationModalComponent>,
  ) { }


  confirmAction(): void {
    this._dialogRef.close(true);
  }
}
