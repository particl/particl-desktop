import { Component, Inject, EventEmitter, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { iif, of } from 'rxjs';
import { concatMap, finalize } from 'rxjs/operators';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';
import { AddressService } from '../../../shared/address.service';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { RPCResponses } from 'app/networks/particl/particl.models';


interface DeleteModalTemplateInputs {
  address: RPCResponses.FilterAddress;
}

enum TextContent {
  DELETE_SUCCESS = 'Address successfully deleted',
  DELETE_FAILED = 'An error occurred while deleting the address'
}


@Component({
  templateUrl: './delete-address-confirmation-modal.component.html',
  styleUrls: ['./delete-address-confirmation-modal.component.scss']
})
export class DeleteAddressConfirmationModalComponent {

  @Output() isDeleted: EventEmitter<boolean> = new EventEmitter();

  public isProcessing: boolean = false;
  public dialogContent: string;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DeleteModalTemplateInputs,
    private dialogRef: MatDialogRef<DeleteAddressConfirmationModalComponent>,
    private _unlocker: WalletEncryptionService,
    private _addressService: AddressService,
    private _snackbar: SnackbarService
  ) { }


  onConfirmDelete(): void {
    if (this.isProcessing) {
      return;
    }
    this.isProcessing = true;

    this._unlocker.unlock({timeout: 10}).pipe(
      concatMap((unlocked: boolean) => iif(
        () => unlocked,
        this._addressService.deleteAddressFromAddressBook(this.data.address.address),
        of(null)
      )),

      finalize(() => this.isProcessing = false)
    ).subscribe(
      (success: boolean | null) => {
        if (success !== null) {
          if (success) {
            this._snackbar.open(TextContent.DELETE_SUCCESS, 'success');
            this.isDeleted.emit(true);
            this.dialogClose();
          } else {
            this._snackbar.open(TextContent.DELETE_FAILED, 'err');
          }
        }
      }
    );
  }

  dialogClose(): void {
    this.dialogRef.close();
  }
}
