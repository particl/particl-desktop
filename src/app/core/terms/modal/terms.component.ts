import {Component, OnInit} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
@Component({
  selector: 'app-terms',
  templateUrl: './terms.component.html',
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit {
  constructor(private dialog: MatDialogRef<TermsComponent>) { }

  ngOnInit() {
  }

  acceptTerms(): void {
    this.dialog.close();
  }
}
