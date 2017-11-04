import { Injectable } from '@angular/core';
import { MdSnackBar, MdSnackBarConfig } from '@angular/material';

@Injectable()
export class FlashNotificationService {

  constructor(private snackBar: MdSnackBar) {
  }

  open(message: string, action?: string, duration?: number): void {
    const config = new MdSnackBarConfig();
    config.duration = duration ? duration : 2000;
    this.snackBar.open(message, action ? action : 'Dismiss', config);
  }

}
