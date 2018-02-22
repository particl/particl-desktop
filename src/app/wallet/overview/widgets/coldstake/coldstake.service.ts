import { Injectable, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Log } from 'ng2-logger';
import { Amount } from '../../../../core/util/utils';

import { RpcService, RpcStateService } from 'app/core/core.module';

@Injectable()
export class ColdstakeService implements OnDestroy {

  private destroyed: boolean = false;
  private log: any = Log.create('coldstake-service');

  public coldstake: any =  {
    txs: [],
    amount: 0
  };

  public hotstake: any = {
    txs: [],
    amount: 0
  };

  coldStakingEnabled: boolean = undefined;
  walletInitialized: boolean = undefined;
  public encryptionStatus: string = 'Locked';

  private progress: Amount = new Amount(0, 2);
  get coldstakeProgress(): number { return this.progress.getAmount() }
  constructor(
    private _rpc: RpcService,
    private _rpcState: RpcStateService
  ) {

    this._rpcState.observe('getwalletinfo', 'encryptionstatus')
      .takeWhile(() => !this.destroyed)
      .subscribe(status => {
        this.encryptionStatus = status;
        this.update();
      });

    this._rpcState.observe('getwalletinfo', 'txcount')
      .takeWhile(() => !this.destroyed)
      .debounceTime(1000/*ms*/)
      .subscribe(txcount => {
        this.update();
      });

    this._rpcState.observe('getblockchaininfo', 'blocks')
      .takeWhile(() => !this.destroyed)
      .debounceTime(10 * 1000/*ms*/)
      .subscribe(status => {
        this.update();
      });

    this._rpcState.observe('ui:coldstaking')
      .takeWhile(() => !this.destroyed)
      .subscribe(status => this.coldStakingEnabled = status);

    this._rpcState.observe('ui:walletInitialized')
      .takeWhile(() => !this.destroyed)
      .subscribe(status => this.walletInitialized = status);
    this.update();
  }

  update() {
    this._rpc.call('getcoldstakinginfo').subscribe(coldstakinginfo => {
      this.log.d('stakingStatus called ' + coldstakinginfo['enabled']);
      this.progress = new Amount(coldstakinginfo['percent_in_coldstakeable_script'], 2);

      this.log.d(`coldstakingamount (actually a percentage) ${this.progress.getAmount()}`);
      this.log.d(`hotstakingamount ${this.hotstake.amount}`);

      if ('enabled' in coldstakinginfo) {
        const enabled = coldstakinginfo['enabled'];
        this._rpcState.set('ui:coldstaking', enabled);
        this.coldStakingEnabled = enabled;
      } else { // ( < 0.15.1.2) enabled = undefined ( => false)
        this._rpcState.set('ui:coldstaking', false);
        this.coldStakingEnabled = false;
      }
      this.updateStakingInfo();
    }, error => this.log.er('couldn\'t get coldstakinginfo', error));
  }

  private updateStakingInfo() {
    const coldstake =  {
      txs: [],
      amount: 0
    }
    const hotstake =  {
      txs: [],
      amount: 0
    }

    this._rpc.call('listunspent').subscribe(unspent => {
      // TODO: Must process amounts as integers
      unspent.map(utxo => {
        if (utxo.coldstaking_address && utxo.address) {
          coldstake.amount += utxo.amount;
          coldstake.txs.push({
            address: utxo.address,
            amount: utxo.amount,
            inputs: [{ tx: utxo.txid, n: utxo.vout }]
          });
        } else if (utxo.address) {
          hotstake.amount += utxo.amount;
          hotstake.txs.push({
            address: utxo.address,
            amount: utxo.amount,
            inputs: [{ tx: utxo.txid, n: utxo.vout }]
          });
        }
      });
      this.coldstake = coldstake;
      this.hotstake = hotstake;
    });
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
