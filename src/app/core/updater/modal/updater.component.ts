import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-updater',
  templateUrl: './updater.component.html',
  styleUrls: ['./updater.component.scss']
})
export class UpdaterComponent implements OnInit {

  public status: number = 0;

  constructor(
    private dialog: MatDialogRef<UpdaterComponent>,
  ) { }

  ngOnInit() {
  }

  /**
   * Used to set the status in the component with latest update progress.
   * @param status
   */
  set(status: any) {
    if (['started', 'busy'].includes(status.status)) {
      this.status = Math.trunc((status.transferred / status.total) * 100);
    } else if (['error', 'done'].includes(status.status)) {
      this.dialog.close();
    }
  }
}
