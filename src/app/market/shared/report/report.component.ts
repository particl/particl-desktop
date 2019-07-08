import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Log } from 'ng2-logger';
import { MatDialog } from '@angular/material';

import { ModalsHelperService } from 'app/modals/modals.module';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';
import { ReportService } from '../../../core/market/api/report/report.service';
import { Listing } from '../../../core/market/api/listing/listing.model';
import { ProcessingModalComponent } from 'app/modals/processing-modal/processing-modal.component';
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
    },
    isReported: true
  });
  @Input() listing: Listing;
  @Input() from: string;
  @Output() complete: EventEmitter<any> = new EventEmitter();
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
    this.openProcessingModal();
    this.reportService.post(this.listing).subscribe(report => {
      this.dialog.closeAll()
      let msg = report.result;
      if ( (Object.prototype.toString.call(report.msgids) === '[object Array]') && report.msgids ) {
        msg = `${this.listing.title} has been reported successfully`;
        this.listing.isFlagged = !this.listing.isFlagged;
        this.listing.VoteDetails = this.defaultVoteDetails;
        this.complete.emit();
      }
      this.snackbar.open(msg, 'info');
    }, err => {
      this.dialog.closeAll()
      this.snackbar.open(err);
    })
  }

  openProcessingModal() {
    const dialog = this.dialog.open(ProcessingModalComponent, {
      disableClose: true,
      data: {
        message: 'Hang on, we are busy processing your vote'
      }
    });
  }

}
