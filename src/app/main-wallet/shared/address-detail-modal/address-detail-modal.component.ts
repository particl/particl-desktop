import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { RPCResponses } from 'app/networks/particl/particl.models';
import { WalletURLState } from '../state-store/wallet-store.state';


interface AddressDetailModalTemplateInputs {
  address: RPCResponses.FilterAddress;
}


@Component({
  templateUrl: './address-detail-modal.component.html',
  styleUrls: ['./address-detail-modal.component.scss']
})
export class AddressDetailModalComponent {

  @Select(WalletURLState.get('address')) addressURL$: Observable<string>;

  readonly address: RPCResponses.FilterAddress;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AddressDetailModalTemplateInputs,
    private _snackbar: SnackbarService
  ) {
    this.address = data.address;
  }

  copyToClipBoard(): void {
    this._snackbar.open('Address copied to clipboard', 'success');
  }
}
