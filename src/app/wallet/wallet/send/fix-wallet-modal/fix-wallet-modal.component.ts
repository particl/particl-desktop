import { Component, Inject, forwardRef, OnInit } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';

import { RpcService, RpcStateService } from 'app/core/core.module';
import { ModalsHelperService } from 'app/modals/modals.module';
import { WalletFixedConfirmationComponent } from './wallet-fixed-confirmation/wallet-fixed-confirmation.component';

@Component({
  selector: 'app-fix-wallet-modal',
  templateUrl: './fix-wallet-modal.component.html',
  styleUrls: ['./fix-wallet-modal.component.scss']
})
export class FixWalletModalComponent implements OnInit {

  constructor(
    private _rpc: RpcService,
    private _rpcState: RpcStateService,

    // @TODO rename ModalsHelperService to ModalsService after modals service refactoring.
    @Inject(forwardRef(() => ModalsHelperService))
    private modals: ModalsHelperService,
    private dialogRef: MatDialogRef<FixWalletModalComponent>,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  fix(): void {
    this.modals.unlock({timeout: 3}, (status) => this.scanChain());
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
