
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store, Select } from '@ngxs/store';
import { Observable, Subject, merge, combineLatest } from 'rxjs';
import { take, takeUntil, tap } from 'rxjs/operators';
import { Particl } from 'app/networks/networks.module';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';


@Component({
  selector: 'main-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit, OnDestroy {

  @Select(Particl.State.Wallet.Info.getValue('encryptionstatus')) walletStatus: Observable<string>;
  @Select(Particl.State.Wallet.Staking.getValue('cold_staking_enabled')) coldStakingEnabled: Observable<boolean>;
  peerListCount: number = 0;
  timeOffset: number = 0;

  private destroy$: Subject<void> = new Subject();
  private _zmqStyle: string = '';
  private _zmqStatus: string = '';
  private _walletEncryption: string = '';


  constructor(
    private _store: Store,
    private _encrypt: WalletEncryptionService
  ) { }

  ngOnInit() {

    const zmq$ = combineLatest([
      this._store.select(Particl.State.Core.isZmqConnected('smsg')).pipe(takeUntil(this.destroy$)),
      this._store.select(Particl.State.Core.isZmqConnected('hashblock')).pipe(takeUntil(this.destroy$))
    ]).pipe(
      tap(([smsg, hashblock]) => {
        const services = [];
        let msg = '';

        switch (true) {
          case !smsg || !hashblock:
            this._zmqStyle = 'zmq-alert';
            if (!smsg) { services.push('SMSG'); }
            if (!hashblock) { services.push('HashBlock'); }
            msg = `Service Unavailable`;
            break;

          default:
            this._zmqStyle = 'zmq-connected';
            msg = `Services connected`;
        }
        this._zmqStatus = `${msg}${services.length ? ': ' + services.join(', ') : '' }`;
      }),
      takeUntil(this.destroy$)
    );


    const walletIcon$ = this.walletStatus.pipe(
      tap(status => {
        this._walletEncryption = status;
      }),
      takeUntil(this.destroy$)
    );

    merge(
      this._store.select(Particl.State.Blockchain.networkValue('connections')).pipe(
        tap((count) => {
          this.peerListCount = count;
        }),
        takeUntil(this.destroy$)
      ),

      this._store.select(Particl.State.Blockchain.networkValue('timeoffset')).pipe(
        tap((offset) => {
          this.timeOffset = offset;
        }),
        takeUntil(this.destroy$)
      ),

      walletIcon$,
      zmq$

    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();
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

  get walletActivated() {
    return this._walletEncryption !== '';
  }

  get zmqStatus(): string {
    return this._zmqStyle;
  }

  get zmqStatusMessage(): string {
    return this._zmqStatus;
  }

  toggleWalletStatus() {
    this._encrypt.changeCurrentStatus().pipe(take(1), takeUntil(this.destroy$)).subscribe();
  }
}
