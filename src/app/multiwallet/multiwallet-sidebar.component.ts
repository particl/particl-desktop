import { Component, OnInit, OnDestroy } from '@angular/core';

import { MultiwalletService, IWallet } from './multiwallet.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { Log } from 'ng2-logger';
import { Router } from '@angular/router';

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
    private multi: MultiwalletService
  ) {
    // get wallet list
    this.multi.list.takeWhile(() => !this.destroyed).subscribe(list => {
      this.list = list;
    });

    this.activeWallet = {
      name: this.walletRpc.wallet,
      fakename: (this.walletRpc.wallet || '').replace('wallet_', ''),
      alreadyLoaded: true
    };
  }

  isWalletActive(w: IWallet): boolean {
    return this.activeWallet && this.activeWallet.name === w.name;
  }

  async switchToWallet(wallet: IWallet) {
    this.log.d('setting wallet to ', wallet);

    this.walletRpc.wallet = wallet.name;

    await this.walletRpc.call('listwallets', []).subscribe(
      walletList => {
        if (walletList.includes(wallet.name)) {
          // Wallet is already loaded, so just requires switching to it
          this.navigateToLoading(wallet.name);
        } else {
          // load the wallet, even possible with the wrong active rpc.
          this.walletRpc.call('loadwallet', [wallet.name]).subscribe(w => {
            this.navigateToLoading(wallet.name);
          });
        }
      },
      error => this.log.er('failed loading wallet', error)
    );
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
