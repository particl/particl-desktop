import { Component, Inject, forwardRef } from '@angular/core';
import { Log } from 'ng2-logger';

import { flyInOut, slideDown } from '../../core/core.animations';
import { FlashNotificationService } from '../../services/flash-notification.service';

import { ModalsService } from '../modals.service';
import { RPCService } from '../../core/rpc/rpc.module';

import { PasswordComponent } from '../shared/password/password.component';
import { MdDialogRef } from '@angular/material';
import { ModalsComponent } from '../modals.component';

@Component({
  selector: 'app-coldstake',
  templateUrl: './coldstake.component.html',
  styleUrls: ['./coldstake.component.scss'],
  animations: [
    flyInOut()
  ]
})
export class ColdstakeComponent {

  log: any = Log.create('coldstake.component');

  // State
  step: number = 0;
  type: string;
  animationState: string;

  // Hot wallet (step 3)
  hotStakeAddress: any = 'Generating...';

  // Cold wallet (step 3)
  prevColdStakeAddress: any = '';
  coldStakeAddress: any = '';
  private validAddress: boolean = undefined;

  // Cold wallet (step 4)
  finalMessage: string = '';

  constructor(
    @Inject(forwardRef(() => ModalsService))
    private _modalsService: ModalsService,
    private _rpc: RPCService,
    private _flashNotificationService: FlashNotificationService,
    public dialogRef: MdDialogRef<ModalsComponent>
  ) { }

  nextStep () {
    this.log.d(`Going to step: ${this.step + 1}`)
    this.step++;
    this.animationState = 'next';
    setTimeout(() => this.animationState = '', 300);
    if ([1, 3].includes(this.step)) {
      const encryptionstatus = this._rpc.state.get('encryptionstatus').trim();
      if (['Unlocked', 'Unencrypted'].includes(encryptionstatus)) {
        this.unlockWallet(encryptionstatus);
      }
    }
  }

  prevStep() {
    this.step--;
    this.animationState = 'prev';
    if ([1, 3].includes(this.step)) {
      this.step--;
    }

    setTimeout(() => this.animationState = '', 300);
  }

  create(type: string) {
    if (['hot', 'cold'].includes(type)) {
      this.type = type;
    }
    this.nextStep();
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
    const hotStakeChain: Array<any> = chains.filter(
      chain => chain.label === 'Cold Staking');

    // if it exists, return to ui
    if (hotStakeChain.length === 1) {
      this.log.d('rpc_filterHotListOfAccounts: coldStakeChain already exist');
      this.hotStakeAddress = hotStakeChain[0].chain;
    } else {
    // else create a new one
      this._rpc.call('getnewextaddress', ['Cold Staking'])
      .subscribe(
        success => this.hotStakeAddress = success,
        error => this.log.er('rpc_filterHotListOfAccounts: getnewextaddress failed: ', error));
    }
  }

  /**
    * called when unlocked (by password component)
    * @param {string} encryptionStatus  The wallet encryption status
    */
  unlockWallet(encryptionStatus: string) {

    if (['Unlocked', 'Unencrypted'].includes(encryptionStatus)) {

      if (this.step === 1) {
        if (this.type === 'cold') {
          this.getColdStakingAddress();
          this.nextStep();
        }

        if (this.type === 'hot') {
          this.rpc_retrieveHotWallet();
          this.nextStep();
        }
      }

      if (this.type === 'cold' && this.step === 3) {
        this.setColdStakingAddress();
        this.nextStep();
      }
    } else {
      this.log.er(`unlockHotWallet, did not unlock: ${encryptionStatus}`);
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
        this.finalMessage = 'Cold staking address is the same - no changes required.';
        this._flashNotificationService.open('Cold staking key is exactly the same as before!', 'warn');
      }
      return;
    }

    this._rpc.call('walletsettings', ['changeaddress', {coldstakingaddress: this.coldStakeAddress}])
      .subscribe(
        success => {
          this.log.d(`setColdStakingAddress: set changeaddress: ${success.changeaddress.coldstakingaddress}`);
          this._flashNotificationService.open('Successfully activated cold staking!', 'info');
          // this.finalMessage = 'Successfully activated cold staking! ' + success.changeaddress.coldstakingaddress;
          this.close();
        },
        error => {
          this.log.er('setColdStakingAddress: ', error);
          this.finalMessage = 'Failed to activate cold staking.. ' + error.message;
        });
  }

  resetColdStakingAddress(): void {
    this._rpc.call('walletsettings', ['changeaddress', {}])
      .subscribe(
        success => {
          this.log.d(`resetColdStakeAddress: set changeaddress: ${success.changeaddress.coldstakingaddress}`);
          this._flashNotificationService.open('Successfully deactivated cold staking!', 'info');
          // this.finalMessage = 'Successfully deactivated cold staking! ' + success.changeaddress.coldstakingaddress;
          this.close();
        },
        error => {
          this.log.er('resetColdStakeAddress: ', error);
          this.finalMessage = 'Failed to deactivate cold staking.. ' + error.message;
        });
  }

  close() {
    this.dialogRef.componentInstance.close();
  }

  setData(data: any) {
    if (data.type !== undefined) {
      this.create(data.type);
    }
  }

  /**
  * We need to send all the public coins to our own wallet to change the output script,
  * if we do not do this then the hot wallet can not stake immediately.
  *
  transferAllCoinsToColdStake(): void {

  } */
}
