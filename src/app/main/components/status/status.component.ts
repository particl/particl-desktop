
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';
import { Store, Select } from '@ngxs/store';
import { Observable, Subject, merge, combineLatest } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { AppDataState } from 'app/core/store/appdata.state';
import { ZmqConnectionState } from 'app/core/store/zmq-connection.state';
import { WalletInfoState } from 'app/main/store/main.state';
import { ConsoleModalComponent } from '../console-modal/console-modal.component';


@Component({
  selector: 'main-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit, OnDestroy {

  @Select(WalletInfoState.getValue('encryptionstatus')) walletStatus: Observable<string>;
  peerListCount: number = 0;
  timeOffset: number = 0;

  private log: any = Log.create('status.component id:' + Math.floor(Math.random() * 1000 + 1));
  private destroy$: Subject<void> = new Subject();
  private _zmqStyle: string = '';
  private _zmqStatus: string = '';
  private _walletEncryption: string = '';


  constructor(
    private _store: Store,
    private _dialog: MatDialog
  ) { }

  ngOnInit() {
    this.log.d('initializing');

    const zmq$ = combineLatest(
      this._store.select(ZmqConnectionState.getStatus('smsg')),
      this._store.select(ZmqConnectionState.getStatus('hashblock'))
    ).pipe(
      tap(([smsg, hashblock]) => {
        const services = [];
        let msg = '';

        switch (true) {
          case !smsg.connected || !hashblock.connected:
            this._zmqStyle = 'zmq-alert';
            if (!smsg.connected) { services.push('SMSG') }
            if (!hashblock.connected) { services.push('HashBlock') }
            msg = `Service Unavailable`;
            break;

          case smsg.error || hashblock.error:
            if (smsg.error) { services.push('SMSG') }
            if (hashblock.error) { services.push('HashBlock') }
            this._zmqStyle = 'zmq-warning';
            msg = `Service Error`;
            break;

          case (smsg.retryCount > 0) || (hashblock.retryCount > 0):
            if (smsg.retryCount > 0) { services.push('SMSG') }
            if (hashblock.retryCount > 0) { services.push('HashBlock') }
            this._zmqStyle = 'zmq-info';
            msg = `Retrying Connection`;
            break;

          default:
            this._zmqStyle = 'zmq-connected';
            msg = `Services connected`;
        }
        this._zmqStatus = `${msg}${services.length ? ': ' + services.join(', ') : '' }`;
      })
    );


    const walletIcon$ = this.walletStatus.pipe(
      tap(status => {
        this._walletEncryption = status;
      })
    );

    merge(
      this._store.select(AppDataState.networkValue('connections')).pipe(
        tap((count) => {
          this.peerListCount = count;
        })
      ),

      this._store.select(AppDataState.networkValue('timeoffset')).pipe(
        tap((offset) => {
          this.timeOffset = offset;
        })
      ),

      walletIcon$,
      zmq$

    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe()
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get peerIcon(): number {
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

  get walletStatusIcon(): string {
    switch (this._walletEncryption) {
      case 'Unencrypted':
        return '-off';
      case 'Unlocked':
        return '-unlocked';
      case 'Unlocked, staking only':
        return '-staking';
      case 'Locked':
        return '-locked';
      default:
        return '-off';
    }
  }

  get zmqStatus(): string {
    return this._zmqStyle;
  }

  get zmqStatusMessage(): string {
    return this._zmqStatus;
  }

  openConsoleWindow() {
    this._dialog.open(ConsoleModalComponent);
  }

  toggleWalletStatus() {
    // switch (this._walletEncryption) {
    //   case 'Unencrypted':
    //     this._modals.encrypt();
    //     break;
    //   case 'Unlocked':
    //   case 'Unlocked, staking only':
    //     this._rpc.call('walletlock')
    //       .subscribe(
    //         success => this._rpcState.stateCall('getwalletinfo'),
    //         error => this.log.er('walletlock error'));
    //     break;
    //   case 'Locked':
    //     this._modals.unlock({showStakeOnly: true, showEditableTimeout: true});
    //     break;
    // }
  }
}
