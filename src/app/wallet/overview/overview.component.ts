
import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

import { ManageWidgetsComponent } from '../../modals/manage-widgets/manage-widgets.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent {
  constructor(public dialog: MatDialog) { }

  openWidgetManager(): void {
    const dialogRef = this.dialog.open(ManageWidgetsComponent);
  }
}
