import { ProductItem } from './../../sell.models';
import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { isBasicObjectType, getValueOrDefault } from '../../../shared/utils';


export interface ProductInfoModalInput {
  product: ProductItem;
}

export interface ProductInfoAction {
  action: 'editTemplate';
  productID: number;
}


@Component({
  templateUrl: './product-info-modal.component.html',
  styleUrls: ['./product-info-modal.component.scss']
})
export class ProductInfoModalComponent {

  readonly productName: string;
  readonly productID: number;


  constructor(
    @Inject(MAT_DIALOG_DATA) private data: ProductInfoModalInput,
    private _dialogRef: MatDialogRef<ProductInfoModalComponent, ProductInfoAction | undefined>,
  ) {

    if (isBasicObjectType(this.data) && isBasicObjectType(this.data.product)) {
      this.productName = getValueOrDefault(this.data.product.title, 'string', '');
      this.productID = +this.data.product.id > 0 ? +this.data.product.id : 0;
    }

  }


  editProductTemplate() {
    if (this.productID <= 0) {
      return;
    }
    this._dialogRef.close({ action: 'editTemplate', productID: this.productID });
  }
}
