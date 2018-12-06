import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';
import { Observable } from 'rxjs/Observable';

import { NotificationService } from 'app/core/notification/notification.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';

import { SettingStateService } from 'app/core/settings/setting-state/setting-state.service';
import { DisplaySettings } from 'app/wallet/settings/models/display/display.settings.model';

@Injectable()
export class NewTxNotifierService implements OnDestroy {

  log: any = Log.create('new-tx-notifier.service id:' + Math.floor((Math.random() * 1000) + 1));
  private destroyed: boolean = false;
  private stake: boolean = false;
  private receive: boolean = false;
  private lastTxId: string = undefined;


  constructor(
    private _rpc: RpcService,
    private _rpcState: RpcStateService,
    private _notification: NotificationService,
    private settingStateService: SettingStateService
  ) {

    this.log.d('tx notifier service running!');
    this._rpcState.observe('getwalletinfo', 'txcount')
      .takeWhile(() => !this.destroyed)
      .subscribe(txcount => {
        this.log.d(`--- update by txcount${txcount} ---`);
        this.checkForNewTransaction();
      });

    this.settingStateService.observe('currentGUISettings', 'display')
      .takeWhile(() => !this.destroyed)
      .subscribe((display: DisplaySettings) => {
        this.stake = display.notifyStakes;
        this.receive = display.notifyPayments;
      });
  }

  // TODO: trigger by ZMQ in the future
  checkForNewTransaction(): void {
    this.log.d('newTransaction()');

    const options = {
      'count': 10
    };
    this._rpc.call('filtertransactions', [options])
      .subscribe(
      (txs: Array<any>) => {

        // if no transactions: stop
        if (txs.length === 0) {
          return;
        }

        // not initialized yet
        if (this.lastTxId === undefined) {
          this.lastTxId = txs[0].txid;
        } else {
          txs.some((tx) => {
            // we hit our last transaction, abort notifications
            if (this.lastTxId === tx.txid) {
              return true;
            }

            this.notifyNewTransaction(tx);
          })

          // update tip
          this.lastTxId = txs[0].txid;
        }
      });
  }

  private notifyNewTransaction(tx: any) {
    this.log.d('notify new tx: ' + tx);
    if (tx.category === 'receive' && this.receive) {
      this._notification.sendNotification(tx.requires_unlock ? 'Incoming private transaction' : 'Incoming transaction',
        tx.requires_unlock ? 'unlock your wallet to see details' : (tx.amount + ' PART received'));
    } else if (tx.category === 'stake' && this.stake) {
      this._notification.sendNotification('New stake reward', tx.amount + ' PART received');
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
