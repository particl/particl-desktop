import { Component, Inject, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { MarketRpcService } from '../../../services/market-rpc/market-rpc.service';

import { isBasicObjectType, getValueOrDefault } from '../../../shared/utils';


enum TextContent {
  UPDATE_SUCCESS = 'Successfully updated address details',
  UPDATE_ERROR = 'Error updating address details!'
}


export interface ChatParticipantEditInputs {
  address: string;
  label: string;
}

export interface ChatParticipantEditedDetails {
  address: string;
  label: string;
}


@Component({
  templateUrl: './chat-participant-edit-modal.component.html',
  styleUrls: ['./chat-participant-edit-modal.component.scss']
})
export class ChatParticipantEditModalComponent implements OnInit {

  @ViewChild('labelInput', {static: true}) labelInput: ElementRef;
  editDetailsForm: FormGroup;
  isProcessing: boolean = false;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ChatParticipantEditInputs,
    private _dialogRef: MatDialogRef<ChatParticipantEditModalComponent>,
    private _rpc: MarketRpcService,
    private _snackbar: SnackbarService
  ) {
    let labelValue = '';
    if (isBasicObjectType(this.data)) {
      labelValue = getValueOrDefault(this.data.label, 'string', labelValue);
    }
    this.editDetailsForm = new FormGroup({
      label: new FormControl(labelValue, [Validators.required, Validators.minLength(1)])
    });
  }


  ngOnInit() {
    this.labelInput.nativeElement.focus();
  }


  updateAddressDetails() {
    if (this.isProcessing || this.editDetailsForm.invalid) {
      return;
    }

    const updateDetails: ChatParticipantEditedDetails = {
      address: this.data.address,
      label: this.editDetailsForm.get('label').value,
    };

    this._rpc.call('chat', [
      'participantupdate',
      this.data.address,
      updateDetails.label,
    ]).pipe(
      catchError(() => of({success: false})),
      map(resp => {
        return isBasicObjectType(resp) && !!resp.success
      }),
      tap(success => {
        this.isProcessing = false;
        if (!success) {
          this._snackbar.open(TextContent.UPDATE_ERROR, 'warn');
          return;
        }
        this._snackbar.open(TextContent.UPDATE_SUCCESS, 'success');
        this._dialogRef.close(updateDetails);
      })
    ).subscribe();
  }

}
