import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { CoreConnectionState } from 'app/core/store/coreconnection.state';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { FilteredAddress } from '../address.models';


interface AddressDetailModalTemplateInputs {
  address: FilteredAddress
};


@Component({
  selector: 'app-qr-code-modal',
  templateUrl: './address-detail-modal.component.html',
  styleUrls: ['./address-detail-modal.component.scss']
})
export class AddressDetailModalComponent {

  @Select(CoreConnectionState.isTestnet) isTestnet: Observable<boolean>;

  readonly address: FilteredAddress;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AddressDetailModalTemplateInputs,
    private _snackbar: SnackbarService
  ) {
    this.address = data.address;
  }

  copyToClipBoard(): void {
    this._snackbar.open('Address copied to clipboard', '');
  }
}
