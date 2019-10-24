import { Injectable, OnDestroy } from '@angular/core';
import { Log } from 'ng2-logger';

import { NotificationService } from 'app/core/notification/notification.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { RpcStateService } from 'app/core/rpc/rpc-state/rpc-state.service';
import { Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { SettingsStateService } from 'app/settings/settings-state.service';

@Injectable()
export class NewTxNotifierService implements OnDestroy {

  log: any = Log.create('new-tx-notifier.service id:' + Math.floor((Math.random() * 1000) + 1));
  private destroyed: boolean = false;

  private lastTxId: string = undefined;

  private doNotifyTxRecieved: boolean = true;
  private doNotifyStakeReceived: boolean = true;
  private rpcState$: Subscription;

  constructor(
    private _rpc: RpcService,
    private _rpcState: RpcStateService,
    private _notification: NotificationService,
    private _settings: SettingsStateService
  ) {

    this.log.d('tx notifier service running!');

    this._settings.observe('settings.wallet.notifications.payment_received').pipe(
      takeWhile(() => !this.destroyed)
    ).subscribe(
      (isSubscribed) => {
        this.doNotifyTxRecieved = Boolean(+isSubscribed);
      }
    );

    this._settings.observe('settings.wallet.notifications.staking_reward').pipe(
      takeWhile(() => !this.destroyed)
    ).subscribe(
      (isSubscribed) => {
        this.doNotifyStakeReceived = Boolean(+isSubscribed);
      }
    );
  }

  start() {
    this.log.d('tx notifier service started!');
    this.rpcState$ = this._rpcState.observe('getwalletinfo', 'txcount')
    .pipe(
      takeWhile(() => !this.destroyed)
    ).subscribe(
      txcount => {
        this.log.d(`--- update by txcount${txcount} ---`);
        this.checkForNewTransaction();
      }
    );
  }

  stop() {
    this.log.d('tx notifier service stopped!');
    if (this.rpcState$ !== undefined) {
      this.rpcState$.unsubscribe();
    }
  }

  // TODO: trigger by ZMQ in the future
  checkForNewTransaction(): void {
    this.log.d('check for new Transaction');

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
    if ( (tx.category === 'receive') && this.doNotifyTxRecieved) {
      this._notification.sendNotification(tx.requires_unlock ? 'Incoming private transaction' : 'Incoming transaction',
        tx.requires_unlock ? 'unlock your wallet to see details' : (tx.amount + ' PART received'));
    } else if ( (tx.category === 'stake') && this.doNotifyStakeReceived) {
      this._notification.sendNotification('New stake reward', tx.amount + ' PART received');
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
  }

}
