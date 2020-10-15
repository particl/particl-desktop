import { Component } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { WalletInfoState } from 'app/main/store/main.state';
import { ConsoleModalComponent } from '../console-modal/console-modal.component';


@Component({
  selector: 'multiwallet-sidebar',
  templateUrl: './multiwallet-sidebar.component.html',
  styleUrls: ['./multiwallet-sidebar.component.scss']
})
export class MultiwalletSidebarComponent {

  @Select(WalletInfoState.getValue('walletname')) walletName: Observable<string>;

  constructor(
    private _dialog: MatDialog
  ) { }

  openConsoleWindow() {
    this.walletName.pipe(take(1)).subscribe(
      (name) => {
        if (name !== null) {
          this._dialog.open(ConsoleModalComponent);
        }
      }
    );
  }
}
