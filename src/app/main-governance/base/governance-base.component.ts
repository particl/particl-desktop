import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog, MatExpansionPanel } from '@angular/material';
import { FormControl } from '@angular/forms';
import { Observable, Subject, merge } from 'rxjs';
import { takeUntil, skipWhile, tap, distinctUntilChanged, switchMap, map, shareReplay } from 'rxjs/operators';

import { Store } from '@ngxs/store';
import { WalletInfoState, WalletUTXOState } from 'app/main/store/main.state';
import { GovernanceState } from '../store/governance-store.state';
import { MainActions } from 'app/main/store/main.actions';
import { WalletUTXOStateModel } from 'app/main/store/main.models';
import { WalletInfoService } from 'app/main/services/wallet-info/wallet-info.service';

import { environment } from 'environments/environment';
import { SnackbarService } from 'app/main/services/snackbar/snackbar.service';
import { GovernanceService } from './governance.service';

import { ProcessingModalComponent } from 'app/main/components/processing-modal/processing-modal.component';

import { PartoshiAmount } from 'app/core/util/utils';


enum TextContent {
  ROUTE_LABEL_PROPOSALS = 'Proposals',
  ROUTE_LABEL_ABOUT = 'About & Howto',
  UNKNOWN_WALLET = '<invalid>',
  DEFAULT_WALLETNAME = 'Default Wallet',
  REFRESH_ERROR = 'Updating of the proposals failed',
  WALLET_LOADING = 'Activating the selected wallet',
}


interface MenuItem {
  text: string;
  path: string;
  icon?: string;
}


interface Wallet {
  name: string;
  displayName: string;
  icon: string;
}


@Component({
  templateUrl: './governance-base.component.html',
  styleUrls: ['./governance-base.component.scss'],
  providers: [GovernanceService]
})
export class GovernanceBaseComponent implements OnInit, OnDestroy {

  readonly clientVersion: string = environment.governanceVersion || '';
  readonly menu: MenuItem[] = [
    { path: 'proposals', icon: 'part-vote', text: TextContent.ROUTE_LABEL_PROPOSALS },
    { path: 'about-howto', icon: 'part-circle-info', text: TextContent.ROUTE_LABEL_ABOUT },
  ];
  readonly selectedWallet$: Observable<Wallet>;
  readonly currentWalletBalance$: Observable<string>;
  readonly otherWallets$: Observable<Wallet[]>;

  private destroy$: Subject<void> = new Subject();

  private walletSwitcherControl: FormControl = new FormControl('');
  @ViewChild(MatExpansionPanel, {static: true}) private walletSelectorPanel: MatExpansionPanel;


  constructor(
    private _store: Store,
    private _snackbar: SnackbarService,
    private _govService: GovernanceService,
    private _walletInfo: WalletInfoService,
    private _dialog: MatDialog
  ) {
    this._govService.startPolling();

    this.selectedWallet$ = this._store.select(WalletInfoState.getValue('walletname')).pipe(
      map((walletName: string) => this.formatWalletDetails(walletName)),
      shareReplay(1),
      takeUntil(this.destroy$)
    );

    this.currentWalletBalance$ = this._store.select(WalletUTXOState).pipe(
      map((utxos: WalletUTXOStateModel) => this.extractSpendableBalance(utxos)),
      takeUntil(this.destroy$)
    );


    this.otherWallets$ = this.selectedWallet$.pipe(
      switchMap((currentWallet) => this._walletInfo.getWalletList().pipe(
        map(wallets =>
          wallets.wallets.sort((a, b) => {
            const x = a.name.toLocaleLowerCase();
            const y = b.name.toLocaleLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
          }).filter(wallet =>
            !(
              wallet.name.startsWith('testnet/') ||
              wallet.name.startsWith('testnet\\') ||
              (wallet.name === 'testnet') ||
              (wallet.name === currentWallet.name)
            )
          ).map(wallet =>
            this.formatWalletDetails(wallet.name)
          )
        ),
      )),
      takeUntil(this.destroy$)
    );
  }


  ngOnInit() {
    merge(
      this._store.select(GovernanceState.requestDidError()).pipe(
        skipWhile(didError => !didError),
        tap(() => this._snackbar.open(TextContent.REFRESH_ERROR, 'warn')),
        takeUntil(this.destroy$)
      ),

      this.walletSwitcherControl.valueChanges.pipe(
        distinctUntilChanged(),
        skipWhile(walletName => typeof walletName !== 'string'),
        tap(() => this._dialog.open(ProcessingModalComponent, {disableClose: true, data: {message: TextContent.WALLET_LOADING}})),
        switchMap((walletName) => this._store.dispatch(new MainActions.ChangeWallet(walletName)).pipe(tap(() => this._dialog.closeAll()))),
        takeUntil(this.destroy$)
      ),
    ).subscribe();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  trackByMenuFn(idx: number, item: MenuItem) {
    return idx;
  }


  trackByAllWalletsFn(idx: number, item: Wallet) {
    return item.name;
  }


  switchWallet(wallet: Wallet) {
    this.walletSelectorPanel.close();
    this.walletSwitcherControl.setValue(wallet.name);
  }


  private formatWalletDetails(walletName: string): Wallet {
    const usedName = walletName === null ?  TextContent.UNKNOWN_WALLET : walletName;
    let dispName = usedName === '' ? TextContent.DEFAULT_WALLETNAME : usedName;
    dispName = this.formatWalletDisplayName(dispName, '/');
    dispName = this.formatWalletDisplayName(dispName, '\\');
    const icon = dispName[0];

    return {
      icon,
      name: walletName,
      displayName: dispName,
    };
  }


  private formatWalletDisplayName(originalName: string, char: string): string {
    const nameParts = originalName.split(char);
    return nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0] || originalName;

  }


  private extractSpendableBalance(allUtxos: WalletUTXOStateModel): string {
    const tempBal = new PartoshiAmount(0);
    const utxos = allUtxos.public || [];

    for (const utxo of utxos) {
      let spendable = true;
      if ('spendable' in utxo) {
        spendable = utxo.spendable;
      }
      if ((!utxo.coldstaking_address || utxo.address) && utxo.confirmations && spendable) {
        tempBal.add(new PartoshiAmount(utxo.amount));
      }
    }

    return tempBal.particlsString();
  }
}
