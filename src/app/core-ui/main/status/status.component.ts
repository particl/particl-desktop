
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Subscription } from 'rxjs/Subscription';
import { Log } from 'ng2-logger';

import { ModalsHelperService } from 'app/modals/modals.module';
import { RpcService, RpcStateService } from '../../../core/core.module';

import { ConsoleModalComponent } from './modal/help-modal/console-modal.component';


@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit, OnDestroy {

  peerListCount: number = 0;
  public coldStakingStatus: boolean;
  public encryptionStatus: string = 'Locked';
  private _sub: Subscription;
  private destroyed: boolean = false;

  private log: any = Log.create('status.component');


  constructor(
    private _rpc: RpcService,
    private _rpcState: RpcStateService,
    /***
     *  @TODO rename ModalsHelperService to ModalsService after modals service refactoring.
    */

    private _modals: ModalsHelperService,
    private dialog: MatDialog) { }

  ngOnInit() {
    this._rpcState.observe('getnetworkinfo', 'connections')
      .takeWhile(() => !this.destroyed)
      .subscribe(connections => this.peerListCount = connections);

    this._rpcState.observe('getwalletinfo', 'encryptionstatus')
      .takeWhile(() => !this.destroyed)
      .subscribe(status => this.encryptionStatus = status);

    this._rpcState.observe('ui:coldstaking')
      .takeWhile(() => !this.destroyed)
      .subscribe(status => this.coldStakingStatus = status);

    /* Bug: If you remove this line, then the state of 'txcount' doesn't update in the Transaction.service */
    this._rpcState.observe('getwalletinfo', 'txcount').takeWhile(() => !this.destroyed).subscribe(txcount => { });
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  getIconNumber(): number {
    switch (true) {
      case this.peerListCount <= 0: return 0;
      case this.peerListCount < 4: return 2;
      case this.peerListCount < 8: return 3;
      case this.peerListCount < 12: return 4;
      case this.peerListCount < 16: return 5;
      case this.peerListCount >= 16: return 6;
      default: return 0;
    }
  }

  getIconEncryption() {
    switch (this.encryptionStatus) {
      case 'Unencrypted':  // TODO: icon?
      case 'Unlocked':
        return '-off';
      case 'Unlocked, staking only':
        return '-stake';
      case 'Locked':
        return '';
      default:
        return '-off'; // TODO: icon?
    }
  }

  getColdStakingStatus() {
    return (this.coldStakingStatus) ? 'enabled' : 'disabled';
  }

  toggle() {
    switch (this.encryptionStatus) {
      case 'Unencrypted':
        this._modals.encrypt();
        break;
      case 'Unlocked':
      case 'Unlocked, staking only':
        this._rpc.call('walletlock')
          .subscribe(
            success => this._rpcState.stateCall('getwalletinfo'),
            error => this.log.er('walletlock error'));
        break;
      case 'Locked':
        this._modals.unlock({showStakeOnly: true});
        break;
      default:
        break;
    }
  }

  /* Open Debug Console Window */
  openConsoleWindow() {
    this.dialog.open(ConsoleModalComponent);
  }
}
