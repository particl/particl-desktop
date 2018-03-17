
import { Component, OnInit } from '@angular/core';
import { RpcStateService } from '../../core/core.module';
import { MatDialog, MatDialogRef } from '@angular/material';

import { ManageWidgetsComponent } from '../../modals/manage-widgets/manage-widgets.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
  testnet: boolean = false;
  constructor(private rpcState: RpcStateService) { }

  constructor( public dialog: MatDialog, ) {}

  openWidgetManager(): void {
    const dialogRef = this.dialog.open(ManageWidgetsComponent);
  }

  ngOnInit() {
    // check if testnet -> Show/Hide Anon Balance
    this.rpcState.observe('getblockchaininfo', 'chain').take(1)
     .subscribe(chain => this.testnet = chain === 'test');
  }

}
