import { Component, OnInit, Inject, forwardRef } from '@angular/core';
import { Log } from 'ng2-logger';

import { ModalsService } from '../modals.service';
import { RPCService } from '../../core/rpc/rpc.module';

import { PasswordComponent } from '../shared/password/password.component';

@Component({
  selector: 'app-coldstake',
  templateUrl: './coldstake.component.html',
  styleUrls: ['./coldstake.component.scss']
})
export class ColdstakeComponent implements OnInit {

  log: any = Log.create('coldstake.component');

  /*  State  */
  step: number = 0;
  type: string;


  /*  Hot wallet (step 3)  */

  hotStakeAddress: any = 'Generating...';

  /*  Cold wallet (step 3)  */
  prevColdStakeAddress: any = '';
  coldStakeAddress: any = '';
  private validAddress: boolean = undefined;
  /*  Cold wallet (step 4)  */
  finalMessage: string = '';

  constructor(
    @Inject(forwardRef(() => ModalsService))
    private _modalsService: ModalsService,
    private _rpc: RPCService
  ) { }

  ngOnInit() {
  }

  nextStep () {
    this.log.d(`Going to step: ${this.step + 1}`)
    this.step++;
  }

  create(type: string) {
    if (['hot', 'cold'].indexOf(type) !== -1) {
      this.type = type;
    }


    if (['Locked', 'Unlocked, staking only'].indexOf(this._rpc.state.get('encryptionstatus')) === -1) {
      // unlock wallet and send transaction
      this.nextStep();
    }

    if (type === 'hot') {
      this.rpc_retrieveHotWallet();
    }

  }


  /** called when the hot wallet unlocked (by password component)  */
  unlockHotWallet(encryptionStatus: String) {
    if (this.step === 1) {
      this.nextStep();
    }

    if (encryptionStatus === 'Unlocked') {
      this.rpc_retrieveHotWallet();
    } else {
      this.log.d(`unlockHotWallet, did not unlock: ${encryptionStatus}`);
    }
  }


  rpc_retrieveHotWallet(): void {
    this.log.d('rpc_retrieveHotWallet called');
    this._rpc.call('extkey', ['account'])
    .subscribe(
      success => this.rpc_filterHotListOfAccounts(success),
      error => this.log.er('rpc_retrieveHotWallet: ', error));
  }

  rpc_filterHotListOfAccounts(response: any) {
    const chains: Array<any> = response.chains;

    // get our cold stake chain if it exists
    const hotStakeChain: Array<any> = chains.filter(function(chain: any){
      return chain.label === 'Cold Staking';
    });

    // if it exists, return to ui
    if (hotStakeChain.length === 1) {
      this.log.d('rpc_filterHotListOfAccounts: coldStakeChain already exist');
      this.hotStakeAddress = hotStakeChain[0].chain;
    } else {
    // else create a new one
      this._rpc.call('getnewextaddress', ['Cold Staking'])
      .subscribe(
        success => this.hotStakeAddress = (success),
        error => this.log.er('rpc_filterHotListOfAccounts: getnewextaddress failed: ', error));
    }
  }


  /**  called when the cold wallet unlocked (by password component)  */
  unlockColdWallet(encryptionStatus: String) {
    if (this.step === 1) {
      this.nextStep();
      this.getColdStakingAddress();

    }

    if (this.step === 3) {
      this.nextStep();
      this.setColdStakingAddress();
    }
  }

  /**  Get the existing cold staking address.  */
  getColdStakingAddress(): void {
    this.log.d('getColdStakingAddress called');
    this._rpc.call('walletsettings', ['changeaddress'])
    .subscribe(
      success => {
        this.log.d(`getColdStakingAddress: got changeaddress: ${success.changeaddress.coldstakingaddress}`);
        this.prevColdStakeAddress = success.changeaddress.coldstakingaddress;
        this.coldStakeAddress = success.changeaddress.coldstakingaddress;
      },
      error => this.log.er('getColdStakingAddress: ', error));
  }

  /**  Set the coldStakeAddress if it has changed.  */
  setColdStakingAddress(): void {
    if (this.prevColdStakeAddress === this.coldStakeAddress) {
      if (this.step === 3) {
        this.nextStep();
      }
      return;
    }

    this._rpc.call('walletsettings', [
      'changeaddress', this.coldStakeAddress
    ])
    .subscribe(
      success => {
        this.log.er(`getColdStakingAddress: set changeaddress: ${success.changeaddress.coldstakingaddress}`);
        this.finalMessage = 'Successfully activated cold staking! ' + success.changeaddress.coldstakingaddress;
      },
      error => {
        this.finalMessage = 'Failed to activate cold staking.. ' + error;
        this.log.er('getColdStakingAddress: ', error);
      });
  }

  /**
  * We need to send all the public coins to our own wallet to change the output script,
  * if we do not do this then the hot wallet can not stake immediately.
  */
  transferAllCoinsToColdStake(): void {

  }
}
