import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';

@Injectable()
export class SnackbarService {

  constructor(private snackBar: MatSnackBar) { }

  open(message: string, type?: string, action?: string): void {
    const config = new MatSnackBarConfig();

    config.duration = (
      ['err', 'warn'].includes(type) ? 10000 :
      'info' === type ? 5000 : 2000);

    this.snackBar.open(message, action ? action : 'Dismiss', config);
  }

}
