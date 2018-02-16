import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Log } from 'ng2-logger';
import { Amount } from '../../../shared/util/utils';

import { StateService } from 'app/core/core.module';
import { RpcService, RpcStateService } from 'app/core/core.module';

@Injectable()
export class ColdstakeService implements OnDestroy {

  private destroyed: boolean = false;
  private log: any = Log.create('coldstake-service');
  public: coldstake: any;
  public: hotstake: any;

  coldStakingEnabled: boolean = undefined;
  walletInitialized: boolean = undefined;
  public encryptionStatus: string = 'Locked';

  private progress: Amount = new Amount(0, 2);
  get coldstakeProgress(): number { return this.progress.getAmount() }

  constructor(
    private _rpc: RpcService,
    private _rpcState: RpcStateService
  ) {
    this.coldstake =  {
      utxos: {
        txs: [],
        amount: 0
      },
      fee: 0,
      script: ""
  }
    this.hotstake =  {
      utxos: {
        txs: [],
        amount: 0
      },
      fee: 0,
      script: ""
    }

    this._rpcState.observe('getwalletinfo', 'encryptionstatus')
      .takeWhile(() => !this.destroyed)
      .subscribe(status => this.encryptionStatus = status);

    this._rpcState.observe('ui:coldstaking')
      .takeWhile(() => !this.destroyed)
      .subscribe(status => this.coldStakingEnabled = status);

    this._rpcState.observe('ui:walletInitialized')
      .takeWhile(() => !this.destroyed)
      .subscribe(status => this.walletInitialized = status);

    this._rpcState.observe('getblockchaininfo', 'blocks')
      .takeWhile(() => !this.destroyed).throttle(val => Observable.interval(10000/*ms*/))
      .subscribe(block => this.rpc_progress());
    this.rpc_progress();
  }

  rpc_progress(): void {
    // TODO: not necessary when cold staking disabled
    this.stakingStatus();
  }

  private stakingStatus() {
    this._rpc.call('getcoldstakinginfo').subscribe(coldstakinginfo => {
      this.log.d('stakingStatus called ' + coldstakinginfo['enabled']);
      this.progress = new Amount(coldstakinginfo['percent_in_coldstakeable_script'], 2);
      this.coldstake.amount = coldstakinginfo['percent_in_coldstakeable_script'];
      this.hotstake.amount = coldstakinginfo['coin_in_stakeable_script'];

      this.log.d(`coldstakingamount (actually a percentage) ${this.coldstake.amount}`);
      this.log.d(`hotstakingamount ${this.hotstake.amount}`);

      if ('enabled' in coldstakinginfo) {
        this._rpcState.set('ui:coldstaking', coldstakinginfo['enabled']);
      } else { // ( < 0.15.1.2) enabled = undefined ( => false)
        this._rpcState.set('ui:coldstaking', false);
      }
      this.update();
    }, error => this.log.er('couldn\'t get coldstakinginfo', error));
  }

  update() {
    updateHotStake();
    this._rpc.call('walletsettings', ['changeaddress']).subscribe(res => {

      this.log.d('pkey', res);
      const pkey = res.changeaddress.coldstakingaddress;
      if (!pkey || pkey === '' || pkey === 'default') {
        return false;
      }

      this._rpc.call('deriverangekeys', [1, 1, pkey]).subscribe(derived => {
        this.log.d('coldstaking address', derived);
        if (!derived || derived.length !== 1) {
          return false;
        }
        const coldstakingAddress = derived[0];

        this._rpc.call('listunspent').subscribe(unspent => {
          // TODO: Must process amounts as integers
          unspent.map(utxo => {
            if (utxo.coldstaking_address // found a cold staking utxo
              || !utxo.address) {
              // skip
            } else {
              this.coldstake.utxos.amount += utxo.amount;
              this.coldstake.utxos.txs.push({
                address: utxo.address,
                amount: utxo.amount,
                inputs: [{ tx: utxo.txid, n: utxo.vout }]
              });
            };
          });

          this._rpc.call('getnewaddress', ['""', 'false', 'false', 'true'])
          .subscribe(spendingAddress => {
            this.log.d('spending address', spendingAddress);
            if (!spendingAddress || spendingAddress === '') {
              return false;
            }

            this._rpc.call('buildscript', [{
              recipe: 'ifcoinstake',
              addrstake: coldstakingAddress,
              addrspend: spendingAddress
            }]).subscribe(script => {

              this.log.d('script', script);
              if (!script || !script.hex) {
                return false;
              }
              this.coldstake.script = script.hex;

              const amount = new Amount(this.coldstake.utxos.amount, 8);
              this.log.d('amount', amount.getAmount());

              this._rpc.call('sendtypeto', ['part', 'part', [{
                subfee: true,
                address: 'script',
                amount: amount.getAmount(),
                script: script.hex
              }], '', '', 4, 64, true, JSON.stringify({
                inputs: this.coldstake.utxos.txs
              })]).subscribe(tx => {

                this.log.d('fees', tx);
                this.coldstake.fee = tx.fee;

              });

            });
          });
        });
      });
    }, error => {
      this.log.er('errr');
    });

  }

  updateHotStake() {
    this._rpc.call('liststealthaddresses', null)
      .subscribe(stealthAddresses => {
        try {
          this.address = stealthAddresses[0]['Stealth Addresses'][0]['Address'];
        } catch (err) {
          this.address = '';
          this.dialogRef.close();
          this.flashNotification.open(
            'No stealth address found, please add a stealthaddress.', 'error');
          return;
        };

        this.log.d('return address', this.address);

        let sentTXs = 0;
        let totalFee = 0;

        this._rpc.call('listunspent').subscribe(unspent => {
          // TODO: Must process amounts as integers
          unspent.map(utxo => {
            if (!utxo.coldstaking_address
              || !utxo.address) {
              // skip
            } else {
              this.hotstake.utxos.amount += utxo.amount;
              this.hotstake.utxos.txs.push({
                address: utxo.address,
                amount: utxo.amount,
                inputs: [{ tx: utxo.txid, n: utxo.vout }]
              });
            };
          });

          this.hotstake.utxos.txs.map(tx => {

            this.log.d('revert fee for address', tx);

            this._rpc.call('sendtypeto', ['part', 'part', [{
              subfee: true,
              address: this.address,
              amount: tx.amount
            }], '', '', 4, 64, true, JSON.stringify({
              inputs: tx.inputs
            })]).subscribe(res => {

              sentTXs++;
              totalFee += res.fee;
              this.log.d(`revert ${sentTXs} fees`, res);

              if (sentTXs === this.hotstake.utxos.txs.length) {
                this.hotstake.fee = totalFee;
              }
            }, error => {
              this.log.er('errr');
            });
          });
        });
      },
        error => {
          this.log.er('errr');
        });
  }

  ngOnDestroy() {
    this.destroyed = true;
  }
}
