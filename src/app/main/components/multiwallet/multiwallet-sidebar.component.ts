import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { Particl } from 'app/networks/networks.module';
import { ConsoleModalComponent } from '../console-modal/console-modal.component';


@Component({
  selector: 'multiwallet-sidebar',
  templateUrl: './multiwallet-sidebar.component.html',
  styleUrls: ['./multiwallet-sidebar.component.scss']
})
export class MultiwalletSidebarComponent {

  @Select(Particl.State.Core.isRunning()) isCoreStarted$: Observable<boolean>;

  constructor(
    private _dialog: MatDialog
  ) { }

  openConsoleWindow() {
    this.isCoreStarted$.pipe(take(1)).subscribe(
      (isStarted) => {
        if (isStarted) {
          this._dialog.open(ConsoleModalComponent);
        }
      }
    );
  }
}
