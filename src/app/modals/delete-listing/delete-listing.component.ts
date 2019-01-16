import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

import { Listing } from 'app/core/market/api/listing/listing.model';
import { Template } from 'app/core/market/api/template/template.model';
import { TemplateService } from 'app/core/market/api/template/template.service';
import { SnackbarService } from 'app/core/snackbar/snackbar.service';

@Component({
  selector: 'app-delete-listing',
  templateUrl: './delete-listing.component.html',
  styleUrls: ['./delete-listing.component.scss']
})
export class DeleteListingComponent implements OnInit {

  public templateToRemove: Template;

  constructor(
    private template: TemplateService,
    private snackbar: SnackbarService,
    private dialogRef: MatDialogRef<DeleteListingComponent>
  ) { }

  ngOnInit() {
  }

  remove() {
    console.log('removing template')
    this.template.remove(this.templateToRemove.id).take(1).subscribe(
      success => this.snackbar.open('Successfully removed listing!'),
      error => this.snackbar.open(error),
      () => this.dialogRef.close()
    )
  }
}
