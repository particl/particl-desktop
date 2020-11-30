import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { isBasicObjectType, getValueOrDefault } from 'app/main-market/shared/utils';
import { GenericModalInfo } from '../joined-markets.models';


@Component({
  templateUrl: './leave-market-modal.component.html',
  styleUrls: ['./leave-market-modal.component.scss']
})
export class LeaveMarketConfirmationModalComponent {

  readonly marketName: string = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: GenericModalInfo,
    private _dialogRef: MatDialogRef<LeaveMarketConfirmationModalComponent>,
  ) {

    let marketName = '';

    if (isBasicObjectType(data) && isBasicObjectType(data.market)) {
      marketName = getValueOrDefault(data.market.name, 'string', marketName);
    }

    this.marketName = marketName;

  }


  doAction() {
    this._dialogRef.close(true);
  }
}
