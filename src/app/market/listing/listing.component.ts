import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-listing',
  templateUrl: './listing.component.html',
  styleUrls: ['./listing.component.scss']
})
export class ListingComponent implements OnInit {

  constructor(
    private dialogRef: MatDialogRef<ListingComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  pictures: any;
  price: any;
  date: any;

  ngOnInit() {

    this.pictures = new Array();
    this.data.listing.ItemInformation.ItemImages.map(image => {
      this.pictures.push(image.ItemImageDatas.find(size => {
        return size.imageVersion === 'MEDIUM';
      }).data);
    });

    let price = this.data.listing.PaymentInformation.ItemPrice.basePrice;
    this.price = {
      int:     price.toFixed(0),
      cents:  (price % 1).toFixed(8),
      escrow: (price * this.data.listing.PaymentInformation.Escrow.Ratio.buyer / 100).toFixed(8)
    };

    this.date = new Date(this.data.listing.createdAt).toLocaleDateString();
  }

  dialogClose(): void {
    this.dialogRef.close();
  }
}
