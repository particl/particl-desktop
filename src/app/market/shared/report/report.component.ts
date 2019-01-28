import { Component, Input } from '@angular/core';
import { Log } from 'ng2-logger';
import { MatDialog } from '@angular/material';

import { ModalsHelperService } from 'app/modals/modals.module';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';
import { ReportService } from '../../../core/market/api/report/report.service';
import { Listing } from '../../../core/market/api/listing/listing.model';
import { ReportModalComponent } from '../../../modals/report-modal/report-modal.component';
import { VoteDetails } from 'app/wallet/proposals/models/vote-details.model';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent {

  private log: any = Log.create('report.component id:' + Math.floor((Math.random() * 1000) + 1));

  // setting dummy object rather calling api
  public defaultVoteDetails: VoteDetails = new VoteDetails({
    ProposalOption: {
      description: 'REMOVE'
    }
  })
  @Input() listing: Listing;
  @Input() from: boolean;
  constructor(
    public reportService: ReportService,
    private modals: ModalsHelperService,
    private snackbar: SnackbarService,
    private dialog: MatDialog
  ) {}

  toggle(): void | boolean {

    if (this.listing.isFlagged) {
      return false;
    }
    const dialogRef = this.dialog.open(ReportModalComponent);
    dialogRef.componentInstance.title = this.listing.title;
    dialogRef.componentInstance.option = this.listing.isFlagged

    dialogRef.componentInstance.isConfirmed.subscribe((res: any) => {
      this.modals.unlock({timeout: 30}, (status) => this.reportItem());
    });
  }

  reportItem(): void {
    this.reportService.post(this.listing.hash).subscribe(report => {
      this.listing.isFlagged = !this.listing.isFlagged;
      this.listing.VoteDetails = this.defaultVoteDetails;
      this.snackbar.open(`${this.listing.title} has been reported successfully`);
    }, err => {
      this.snackbar.open(err);
    })
  }

}
