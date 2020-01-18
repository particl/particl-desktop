
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Log } from 'ng2-logger';
import { Store } from '@ngxs/store';
import { Subject, merge, combineLatest } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { AppDataState } from 'app/core/store/appdata.state';
import { ZmqConnectionState } from 'app/core/store/zmq-connection.state';
import { ConsoleModalComponent } from '../console-modal/console-modal.component';


@Component({
  selector: 'main-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit, OnDestroy {

  peerListCount: number = 0;
  walletStatus: string = '-off';
  timeOffset: number = 0;

  private log: any = Log.create('status.component id:' + Math.floor(Math.random() * 1000 + 1));
  private destroy$: Subject<void> = new Subject();
  private _zmqStyle: string = '';
  private _zmqStatus: string = '';


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
    // to be implemented
    return '-off';
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
    // to be implemented
  }
}
