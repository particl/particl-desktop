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
  // listing is in data.listing

  ngOnInit() {
  }

  dialogClose(): void {
    this.dialogRef.close();
  }
}
