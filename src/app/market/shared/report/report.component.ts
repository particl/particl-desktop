import { Component, Input } from '@angular/core';
import { Log } from 'ng2-logger';
import { MatDialog } from '@angular/material';

import { SnackbarService } from '../../../core/snackbar/snackbar.service';
import { ReportService } from '../../../core/market/api/report/report.service';
import { Listing } from '../../../core/market/api/listing/listing.model';
import { ReportModalComponent } from '../../../modals/report-modal/report-modal.component';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent {

  private log: any = Log.create('report.component id:' + Math.floor((Math.random() * 1000) + 1));

  @Input() listing: Listing;
  @Input() flag: boolean = true;
  constructor(
    public reportService: ReportService,
    private snackbar: SnackbarService,
    private dialog: MatDialog
  ) {}

  toggle() {
    const dialogRef = this.dialog.open(ReportModalComponent);
    dialogRef.componentInstance.title = this.listing.title;
    dialogRef.componentInstance.option = this.listing.proposalOption

    dialogRef.componentInstance.isConfirmed.subscribe((res: any) => {

      this.reportService.post(this.listing).subscribe(report => {
        this.listing.proposalOption = !this.listing.proposalOption;
        this.snackbar.open(`Listing ${this.listing.title}`);
      })

    });
  }
}
