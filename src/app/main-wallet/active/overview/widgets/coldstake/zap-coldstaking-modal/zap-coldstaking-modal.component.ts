import { Component, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import { MainRpcService } from 'app/main/services/main-rpc/main-rpc.service';
import { PartoshiAmount } from 'app/core/util/utils';
import { Log } from 'ng2-logger';
import { WalletEncryptionService } from 'app/main/services/wallet-encryption/wallet-encryption.service';

/*
  Could pre-generate and sign all transactions then slowly emit them.
  Issues:
   - Locktime would need to be faked or blank.
   - Updating num_derives as that can't be done while the wallet is locked.
    - Setting num_derives at tx generation is risky, if a user generates 100 txns, emits 10 and cancels,
      the stakenode lookahead won't be able to catch up to the value on the spending node.
      - Could be done from v0.19.2.14 by adding the coldstaking changeaddress as a track-only address.

  Current workaround is to unlock the wallet for 5 hours and relock when the modal closes.
*/

interface ZapTemplateInputs {
  fee: number;
}

interface InputSelection {
  selected: Array<Object>;
  total_value: PartoshiAmount;
}

interface GroupedCandidates {
  groups: Map<string, Array<Object> >;
  group_totals: Map<string, PartoshiAmount>;
}

@Component({
  templateUrl: './zap-coldstaking-modal.component.html',
  styleUrls: ['./zap-coldstaking-modal.component.scss']
})
export class ZapColdstakingModalComponent {

  @Output() isConfirmed: EventEmitter<boolean> = new EventEmitter();

  is_zapping: boolean = false;
  select_mode: number = 1;
  delay_for: number = 600;
  readonly fee: number = 0;
  readonly max_select: number = 20;
  readonly max_value: number = 1000;
  dust_partoshis: number = 10000;
  txns_created: number = 0;
  next_tx_at: string = '';
  timer: ReturnType<typeof setTimeout>;
  str_error: string = '';
  str_message: string = '';
  outputs_start: number = 0;
  outputs_current: number = 0;
  value_start: PartoshiAmount = new PartoshiAmount(0);
  value_current: PartoshiAmount = new PartoshiAmount(0);

  private log: any = Log.create('zap-coldstaking-modal.component');

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ZapTemplateInputs,
    private _dialogRef: MatDialogRef<ZapColdstakingModalComponent>,
    private _rpc: MainRpcService,
    private _unlocker: WalletEncryptionService,
  ) {
    this.fee = Math.max(+data.fee || 0, 0);
    this._dialogRef.beforeClosed().subscribe(data=>{
      this.stopZapping();
      this._unlocker.lock().subscribe();
    })

    this.gatherInfo();
  }

  selectModeChanged(event): boolean {
    this.select_mode = event.target.value;
    return true;
  }

  delayForChanged(event): boolean {
    this.delay_for = event.target.value;
    return true;
  }

  pad2(i): string {
    return (`0${i}`).slice(-2);
  }

  stopZapping(): void {
    this.log.i('Stopping zapping');
    this.is_zapping = false;
    clearTimeout(this.timer);
  }

  errorToString(e): string {
    if (typeof e === 'object') {
      return e.message;
    }
    if (typeof e === 'string') {
      return e;
    }
    return JSON.stringify(e);
  }

  selectInputs(groups, group_totals): InputSelection {
    let selected = new Array();
    let total_value = new PartoshiAmount(0);
    const max_value = new PartoshiAmount(this.max_value).partoshis();
    let addrs = group_totals.keys();
    // TODO: sort groups by value

    for (let addr of addrs) {
      let txos = groups.get(addr);

      while (true) {
        if (txos.length < 1) {
          groups.delete(addr);
          group_totals.delete(addr);
        }
        if (selected.length >= this.max_select || total_value.partoshis() >= max_value) {
          return {
            selected: selected,
            total_value: total_value
          }
        }
        if (txos.length < 1) {
          break;
        }
        let txo = txos.pop();
        total_value.add(new PartoshiAmount(txo['amount']));
        selected.push(txo);
      }
      if (this.select_mode == 2) {
        return {
          selected: selected,
          total_value: total_value
        }
      }
    }

    return {
      selected: selected,
      total_value: total_value
    };
  }

  async groupCandidates(): Promise<GroupedCandidates> {
    let address_groups = new Map();
    let groups = new Map();
    let group_totals = new Map();

    const utxos = await this._rpc.call('listunspent').toPromise();

    if (this.select_mode == 2) {
      const ags = await this._rpc.call('listaddressgroupings').toPromise();
      for (let ag of ags) {
        if (ag.length < 2) {
          continue;
        }
        let grouping_name = `group_${ag.length}`;
        for (let a of ag) {
          address_groups[a[0]] = grouping_name;
        }
      }
    }

    for (let txo of utxos) {
      if ('coldstaking_address' in txo) {
        continue;
      }
      if (!txo['desc'].startsWith('pkh(')) {
        continue;
      }
      let addr = txo['address'];
      if (address_groups.has(addr)) {
        addr = address_groups.get(addr);
      }
      if (!groups.has(addr)) {
        groups.set(addr, new Array<typeof txo>());
      }
      groups.get(addr).push(txo);
      if (!group_totals.has(addr)) {
        group_totals.set(addr, new PartoshiAmount(0));
      }
      group_totals.set(addr, group_totals.get(addr).add(new PartoshiAmount(txo['amount'])));
    }
    // Sort utxos by value asc
    for (let addr of groups.keys()) {
      groups.set(addr, groups.get(addr).sort((a, b) => (a['amount'] < b['amount'] ? 1 : -1)));
    }
    return {
      groups: groups,
      group_totals: group_totals
    };
  }

  async gatherInfo() {
    this.log.d('Gathering info'
    );
    let utxos = await this.groupCandidates();

    while (true) {
      var inputs = this.selectInputs(utxos.groups, utxos.group_totals)
      if (inputs.selected.length < 1) {
        break;
      }
      if (inputs.total_value.partoshis() < this.dust_partoshis) {
        //this.log.d('Skipping inputs below dust value');
        continue;
      }
      this.outputs_start += inputs.selected.length;
      this.value_start.add(inputs.total_value);
    }
    this.log.d(`Candidate outputs ${this.outputs_start}, value ${this.value_start.particlsString()}`);
  }

  async createZapTx(spend_address, stake_address): Promise<boolean> {
    if (!this.is_zapping) {
      return;
    }
    this.log.d('createZapTx');

    let utxos = await this.groupCandidates();

    if (utxos.groups.size < 1) {
      this.log.i('No valid inputs');
      return false
    }

    while (true) {
      var inputs = this.selectInputs(utxos.groups, utxos.group_totals)
      if (inputs.selected.length < 1) {
        this.log.i('No valid inputs');
        return false;
      }
      if (inputs.total_value.partoshis() < this.dust_partoshis) {
        this.log.i('Skipping inputs below dust value');
        continue;
      }
      break;
    }

    let prevouts = new Array<Object>();
    for (let utxo of inputs.selected) {
      prevouts.push({ tx: utxo['txid'], n: utxo['vout'] })
    }
    let txid = await this._rpc.call('sendtypeto', [
      'part',
      'part',
      [ {
          subfee: true,
          address: spend_address,
          stakeaddress: stake_address,
          amount: inputs.total_value.particlsString()
        } ],
      'zap',
      '',
      1,
      5,
      false,
      {inputs: prevouts}
    ]).toPromise();

    this.log.d('Sending zap txn', txid);
    this.outputs_current += prevouts.length;
    this.value_current.add(inputs.total_value);

    return true;
  }

  async createZapTxns(spend_address, stake_address) {
    try {
      if (!this.is_zapping) {
        return;
      }

      let rv = await this.createZapTx(spend_address, stake_address);

      this.txns_created += 1;
      if (!rv) {
        this.log.i('Zapping complete');
        this.str_message = 'Zapping complete';
        this.stopZapping();
        this._unlocker.lock();
        return;
      }

      let half_delay = this.delay_for * 0.5;
      let delay_for = half_delay + Math.floor(Math.random() * this.delay_for);
      let ts = Date.now();
      let dt_text = new Date(ts + delay_for * 1000);
      let hours = this.pad2(dt_text.getHours());
      let minutes = this.pad2(dt_text.getMinutes());
      let seconds = this.pad2(dt_text.getSeconds());
      this.next_tx_at = `${hours}:${minutes}:${seconds}`;

      this.log.i('Delaying for', delay_for);
      this.timer = setTimeout(this.createZapTxns.bind(this), delay_for * 1000, spend_address, stake_address)
    } catch(e) {
      this.str_error = this.errorToString(e);
      this.log.er(e);
      this.stopZapping();
    }
  }

  async zap() {
    this.log.i(`Starting zapping, mode ${this.select_mode}, delay ${this.delay_for}`);
    this.is_zapping = true;
    this.txns_created = 0;

    try {
      const extkey_accounts = await this._rpc.call('extkey', ['account']).toPromise();
      let spend_address = '';
      for (let chain of extkey_accounts['chains']) {
        if ('function' in chain &&  chain['function'] == 'active_internal') {
          spend_address = chain['chain'];
          break;
        }
      }

      const walletsettings_changeaddress = await this._rpc.call('walletsettings', ['changeaddress']).toPromise();
      let stake_address = walletsettings_changeaddress['changeaddress']['coldstakingaddress'];
      this.log.d(`Using spend_address ${spend_address}, stake_address ${stake_address}`);

      this.createZapTxns(spend_address, stake_address);
    } catch(e) {
      this.str_error = this.errorToString(e);
      this.log.er(e);
      this.stopZapping();
    }
  }
}
