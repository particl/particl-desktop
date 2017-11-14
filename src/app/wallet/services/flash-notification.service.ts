import { Injectable } from '@angular/core';
import { MdSnackBar, MdSnackBarConfig } from '@angular/material';

@Injectable()
export class FlashNotificationService {

  constructor(private snackBar: MdSnackBar) {
  }

  open(message: string, type?: string, action?: string): void {
    const config = new MdSnackBarConfig();

    if (['err', 'warn'].includes(type)) { // tx, cold stake
      config.duration = 10000;
    } else if (['info'].includes(type)) {
      config.duration = 5000;
    } else { // copy paste, etc
      config.duration = 2000;
    }

    this.snackBar.open(message, action ? action : 'Dismiss', config);
  }

}
