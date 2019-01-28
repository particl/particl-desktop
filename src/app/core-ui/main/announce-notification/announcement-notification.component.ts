import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval } from 'rxjs/observable/interval';

import { environment } from '../../../../environments/environment';

import { MatDialog, MatDialogRef } from '@angular/material';
import { AlphaMainnetWarningComponent } from '../../../modals/alpha-mainnet-warning/alpha-mainnet-warning.component';

@Component({
  selector: 'app-announcement-notification',
  templateUrl: './announcement-notification.component.html',
  styleUrls: ['./announcement-notification.component.scss']
})
export class AnnouncementNotificationComponent implements OnInit, OnDestroy {

  private destroyed: boolean = false;
  private mainNet: boolean = false;
  constructor(
    public dialog: MatDialog // Alpha mainnet warning
  ) { }

  ngOnInit() {
    this.mainNet = (environment.version).includes('alpha');
  }

  // no need to destroy.
  ngOnDestroy() {
    this.destroyed = true;
  }

  // Alpha mainnet warning
  readFullWarning(): void {
    const dialogRef = this.dialog.open(AlphaMainnetWarningComponent);
  }

}
