import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { Log } from 'ng2-logger'
import { Observable } from 'rxjs/Observable';

import { TermsComponent } from 'app/modals/terms/terms.component';
import { termsObj } from 'app/core-ui/main/terms/terms-txt';

@Injectable()
export class TermsService {

  log: any = Log.create('terms.service');

  constructor(private dialog: MatDialog) {
    this.log.d('terms service');
    this.checkForNewVersion();
  }

  checkForNewVersion() {
    if (!this.getVersion() || (this.getVersion() && this.getVersion().version !== termsObj.version)) {
      const dialogRef = this.dialog.open(TermsComponent, { disableClose: true })
      dialogRef.componentInstance.text = termsObj.text;
      dialogRef.afterClosed().subscribe(() => {
        this.setVersion();
      });
    }
  }

  getVersion(): any {
    return JSON.parse(localStorage.getItem('terms'));
  }

  setVersion() {
    localStorage.setItem('terms', JSON.stringify(termsObj));
  }
}
