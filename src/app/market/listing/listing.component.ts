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

  ngOnInit() {
    this.pictures = new Array();
    data.listing.ItemInformation.ItemImages.map(image => {
      this.pictures.push(image.ItemImageDatas.find(size => {
        return size.imageVersion === 'MEDIUM';
      }).data);
    });
  }

  dialogClose(): void {
    this.dialogRef.close();
  }
}
