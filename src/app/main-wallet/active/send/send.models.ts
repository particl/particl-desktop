import { AddressType } from '../../shared/address.models';
import { PartoshiAmount } from 'app/core/util/utils';


export type TabType = 'transfer' | 'send';
export type TxType = 'anon' | 'blind' | 'part';

export const MIN_RING_SIZE = 3;
export const MAX_RING_SIZE = 32;
export const DEFAULT_RING_SIZE = 24;


export interface TabModel {
  icon: string;
  type: TabType;
  title: string;
}


export interface TxTypeOption {
  name: string;
  balance: number;
  displayedBalance: string;
  coinInputs: {tx: string, n: number, amount: number}[];
  value: TxType;
  help: string;
  description: string;
  color: string;
}


export interface SavedAddress {
  address: string;
  label: string;
  type: AddressType;
}


export interface SendTypeToEstimateResponse {
  bytes: number;
  fee: number;
  need_hwdevice: boolean;
  outputs_fee: any;
}

export interface SendTypeToCoinControl {
  changeaddress?: string;
  inputs?: {tx: string, n: number}[];
  replaceable?: boolean;
  conf_target?: number;
  estimate_mode?: 'UNSET' | 'ECONOMICAL' | 'CONSERVATIVE';
  avoid_reuse?: boolean;
  feeRate?: number | string;
}


export class SendTransaction {
  transactionType: TabType = 'send';
  source: TxType = 'part';
  targetAddress: string = '';
  addressLabel: string = '';
  targetTransfer: TxType = 'part';
  amount: number;
  narration: string = '';
  ringSize: number = 8;
  deductFeesFromTotal: boolean = false;
  coinControl: SendTypeToCoinControl = {};


  constructor() {}

  getSendTypeParams(estimate: boolean = true, utxoCount: number = 1): [
    TxType,
    TxType,
    Array<{address: string, amount: number, subfee: boolean, narr: string}>,
    string,
    string,
    number,
    number,
    boolean,
    SendTypeToCoinControl
  ] {

    let ringSize = this.ringSize;
    if (ringSize > MAX_RING_SIZE || ringSize < MIN_RING_SIZE) {
      ringSize = DEFAULT_RING_SIZE;
    }

    const outputs: {address: string, amount: number, subfee: boolean, narr: string}[] = [];

    if ((utxoCount > 0) && this.amount) {
      const calculatedAmount = new PartoshiAmount(this.amount / utxoCount, false).particls();
      const remainderAmount = new PartoshiAmount(this.amount, false);

      for (let ii = 1; ii < utxoCount; ++ii) {
        outputs.push({
          address: this.targetAddress,
          amount: calculatedAmount,
          subfee: this.deductFeesFromTotal,
          narr: this.narration
        });
        remainderAmount.subtract(new PartoshiAmount(calculatedAmount, false));
      }
      // Ensure that the last utxo captures any remainder non-evenly-divisble amount
      outputs.push({
        address: this.targetAddress,
        amount: remainderAmount.particls(),
        subfee: this.deductFeesFromTotal,
        narr: this.narration
      });
    }

    return [
      this.source,
      this.getTargetType(),
      outputs,
      null,
      null,
      ringSize,
      MAX_RING_SIZE,
      estimate,
      this.coinControl
    ];
  }

  getTargetType(): TxType {
    return this.transactionType === 'send' ? this.source : this.targetTransfer;
  }

}