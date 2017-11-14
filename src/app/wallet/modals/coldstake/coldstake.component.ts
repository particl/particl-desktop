import { Component, Inject, forwardRef } from '@angular/core';
import { Log } from 'ng2-logger';

import { flyInOut, slideDown } from '../../../core-ui/core.animations';
import { FlashNotificationService } from '../../services/flash-notification.service';

import { ModalsService } from '../modals.service';
import { RpcService } from '../../../core/core.module';

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
  animationState: string;

  // Cold wallet (step 2)
  prevColdStakeAddress: any = '';
  coldStakeAddress: any = '';
  private validAddress: boolean = undefined;

  // Cold wallet (step 3)
  finalMessage: string = '';

  constructor(
    @Inject(forwardRef(() => ModalsService))
    private _modalsService: ModalsService,
    private _rpc: RpcService,
    private _flashNotificationService: FlashNotificationService,
    public dialogRef: MdDialogRef<ModalsComponent>
  ) {
    this.nextStep();
  }

  nextStep () {
    this.log.d(`Going to step: ${this.step + 1}`)
    this.step++;
    this.animationState = 'next';
    setTimeout(() => this.animationState = '', 300);
    if ([0, 2].includes(this.step)) {
      const encryptionstatus = this._rpc.state.get('encryptionstatus').trim();
      if (['Unlocked', 'Unencrypted'].includes(encryptionstatus)) {
        this.unlockWallet(encryptionstatus);
      }
    }
  }

  prevStep() {
    this.step--;
    this.animationState = 'prev';
    if ([0, 2].includes(this.step)) {
      this.step--;
    }

    setTimeout(() => this.animationState = '', 300);
  }

  /**
    * called when unlocked (by password component)
    * @param {string} encryptionStatus  The wallet encryption status
    */
  unlockWallet(encryptionStatus: string) {

    if (['Unlocked', 'Unencrypted'].includes(encryptionStatus)) {

      if (this.step === 0) {
        this.getColdStakingAddress();
        this.nextStep();
      }

      if (this.step === 2) {
        this.setColdStakingAddress();
        this.nextStep();
      }
    } else {
      this.log.er(`unlockWallet, did not unlock: ${encryptionStatus}`);
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
      if (this.step === 2) {
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
          this._rpc.state.set('ui:coldstaking', success.changeaddress.coldstakingaddress);
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

  /**
  * We need to send all the public coins to our own wallet to change the output script,
  * if we do not do this then the hot wallet can not stake immediately.
  *
  transferAllCoinsToColdStake(): void {

  } */
}
