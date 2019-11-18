import { Component, OnInit, OnDestroy } from '@angular/core';

import { MultiwalletService, IWallet } from './multiwallet.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { Log } from 'ng2-logger';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { SettingsStateService } from 'app/settings/settings-state.service';

@Component({
  selector: 'multiwallet-sidebar',
  templateUrl: './multiwallet-sidebar.component.html',
  styleUrls: ['./multiwallet-sidebar.component.scss']
})
export class MultiwalletSidebarComponent implements OnInit, OnDestroy {
  private log: any = Log.create(
    'multiwallet-sidebar.component id:' + Math.floor(Math.random() * 1000 + 1)
  );
  private destroyed: boolean = false;

  public list: Array<IWallet> = [];
  public activeWallet: IWallet;

  constructor(
    private walletRpc: RpcService,
    private router: Router,
    private multi: MultiwalletService,
    private _settingsService: SettingsStateService
  ) {
    // get wallet list
    this.multi.list.pipe(takeWhile(() => !this.destroyed)).subscribe(list => {
      this.list = list;
    });

    this._settingsService.currentWallet().pipe(
      takeWhile(() => !this.destroyed)
    ).subscribe(
      (wallet) => {
        // Primary purpose of the null check is to cater for live reload...
        //  this should not typically be needed otherwise
        if (wallet === null) {
          return;
        }
        this.activeWallet = wallet;
      }
    );
  }

  isWalletActive(w: IWallet): boolean {
    return (this.activeWallet !== undefined) && (this.activeWallet.name === w.name);
  }

  switchToWallet(wallet: IWallet) {
    this.log.d('setting wallet to ', wallet);
    this.navigateToLoading(wallet.name);
  }

  goToWalletCreation() {
    this.router.navigate(['/installer/create'], {
      queryParams: { previouswallet: this.activeWallet.name }
    });
  }

  private navigateToLoading(walletName: string) {
    this.router.navigate(['/loading'], {
      queryParams: { wallet: walletName }
    });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.destroyed = true;
  }
}
