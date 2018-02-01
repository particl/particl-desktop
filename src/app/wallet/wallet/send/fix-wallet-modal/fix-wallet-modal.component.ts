import { Component, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';

import { RpcService } from 'app/core/core.module';
import { ModalsService } from 'app/modals/modals.module';
import { WalletFixedConfirmationComponent } from './wallet-fixed-confirmation/wallet-fixed-confirmation.component';

@Component({
  selector: 'app-fix-wallet-modal',
  templateUrl: './fix-wallet-modal.component.html',
  styleUrls: ['./fix-wallet-modal.component.scss']
})
export class FixWalletModalComponent implements OnInit {

  constructor(
    private _rpc: RpcService,
    private _modals: ModalsService,
    private dialogRef: MatDialogRef<FixWalletModalComponent>,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  fix(): void {
    if (this._rpc.state.get('locked')) {
      // unlock wallet and send transaction
      this._modals.open('unlock', {forceOpen: true, timeout: 3, callback: this.scanChain.bind(this)});
    } else {
      // wallet already unlocked
      this.scanChain();
    }
  }

  scanChain() {
    this._rpc.call('scanchain', [0]).subscribe(
      (result: any) => {
        this.dialog.open(WalletFixedConfirmationComponent);
      },
      (error: any) => {}
    )
  }

  dialogClose(): void {
    this.dialogRef.close();
  }
}
