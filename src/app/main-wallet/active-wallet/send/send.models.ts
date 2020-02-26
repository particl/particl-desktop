import { AddressType } from '../shared/address.models';


export type TabType = 'transfer' | 'send';
export type TxType = 'anon' | 'blind' | 'part';

export const MIN_RING_SIZE = 3;
export const MAX_RING_SIZE = 32;
export const DEFAULT_RING_SIZE = 5;


export interface TabModel {
  icon: string;
  type: TabType;
  title: string;
}


export interface TxTypeOption {
  name: string;
  balance: number;
  displayedBalance: string;
  value: TxType;
  help: string;
  description: string;
}


export interface ValidatedAddress {
  isvalid: boolean;
  address: string;
  scriptPubKey: string;
  isscript: boolean;
  iswitness: boolean;
  witness_version?: number;
  witness_program?: string;
  isstealthaddress?: boolean;
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
  outputs_fee: any
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

  constructor() {}

  getSendTypeParams(estimate: boolean = true): [
    TxType, TxType, Array<{address: string, amount: number, subfee: boolean, narr: string}>, string, string, number, number, boolean
  ] {

    let ringSize = this.ringSize;
    if (ringSize > MAX_RING_SIZE || ringSize < MIN_RING_SIZE) {
      ringSize = DEFAULT_RING_SIZE;
    }

    return [
      this.source,
      this.getTargetType(),
      [{
        address: this.targetAddress,
        amount: this.amount,
        subfee: this.deductFeesFromTotal,
        narr: this.narration
      }],
      null,
      null,
      ringSize,
      MAX_RING_SIZE,
      estimate
    ];
  }

  getTargetType(): TxType {
    return this.transactionType === 'send' ? this.source : this.targetTransfer;
  }

}
