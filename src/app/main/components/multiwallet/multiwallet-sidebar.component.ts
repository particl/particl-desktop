import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';

import { routes } from 'app/main/main-routing.module';
import { Particl } from 'app/networks/networks.module';
import { ConsoleModalComponent } from '../console-modal/console-modal.component';


@Component({
  selector: 'multiwallet-sidebar',
  templateUrl: './multiwallet-sidebar.component.html',
  styleUrls: ['./multiwallet-sidebar.component.scss']
})
export class MultiwalletSidebarComponent {

  readonly apps: {class: string; route: string; icon: string; title: string}[] = [];

  @Select(Particl.State.Core.isRunning()) isCoreStarted$: Observable<boolean>;

  constructor(
    private _dialog: MatDialog
  ) {

    routes.forEach(r => {
      if (r.children) {
        r.children.forEach(rc => {
          if (rc.data && rc.data.showShortcut === true) {
            this.apps.push({
              route: rc.path,
              class: `${rc.path} app`,
              icon: rc.data.icon || '',
              title: rc.data.title || '',
            });
          }
        });
      }
    });
  }

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
