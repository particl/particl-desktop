import { PartoshiAmount, DateFormatter } from 'app/core/util/utils';


type CategoryType = 'send' | 'receive' | 'stake' | 'internal_transfer' | 'orphaned_stake' | 'unknown';
export type CategoryFilterType = 'all' | CategoryType;

export type SortFilterType = 'time' | 'amount' | 'address' | 'category' | 'confirmations' | 'txid';

type TransactionType = 'standard' | 'blind' | 'anon';
export type TransactionFilterType = 'all' | TransactionType;


export enum AddressType {
  NORMAL,
  STEALTH,
  MULTISIG
}


export enum TxTransferType {
  NONE,
  SPLIT,
  PUBLIC,
  BLIND,
  ANON
}


export interface FilterTransactionOptionsModel {
  count?: number;
  skip?: number;
  include_watchonly?: boolean;
  search?: string;
  category?: CategoryFilterType;
  type?: TransactionFilterType;
  sort?: SortFilterType;
}


interface FilterTransactionOutputModel {
  stealth_address?: string;
  address?: string;
  coldstake_address?: string;
  label?: string;
  type?: TransactionType;
  amount: number;
  vout: number;
  narration?: string;
}


export interface FilterTransactionModel {
  confirmations: number;
  trusted?: boolean;
  txid: string;
  time: number;
  timereceived?: number;
  fee?: number;
  reward?: number;
  requires_unlock?: boolean;
  category: CategoryType;
  abandoned?: boolean;
  outputs: FilterTransactionOutputModel[];
  amount: number;
}


export class FilteredTransaction {

  readonly txid: string;
  readonly address: string ;
  readonly category: CategoryType;
  readonly amount: number;
  readonly amountWhole: string;
  readonly amountFraction: string;
  readonly netAmount: number;
  readonly reward: number;
  readonly fee: number;
  readonly time: number;
  readonly formattedTime: string;
  readonly requires_unlock: boolean;
  readonly outputs: FilterTransactionOutputModel[];
  readonly confirmations: number;
  readonly addressType: AddressType;
  readonly transferType: TxTransferType;

  readonly isListingFee: boolean;

  readonly narration: string;


  constructor(json: FilterTransactionModel) {
    /* transactions */
    this.txid = json.txid;
    this.category = json.category;

    const partoshiAmount = new PartoshiAmount(Math.abs(+json.amount) * Math.pow(10, 8));
    this.amount = +json.amount;
    this.amountWhole = (this.amount < 0 ? '-' : '+') + partoshiAmount.particlStringInteger();
    this.amountFraction = partoshiAmount.particlStringFraction();

    this.reward = +json.reward ? +json.reward : 0;
    this.fee = +json.fee ? +json.fee : 0;
    this.time = json.time;
    this.formattedTime = new DateFormatter(new Date(this.time * 1000)).dateFormatter(false);
    this.requires_unlock = json.requires_unlock ? json.requires_unlock : false;
    this.confirmations = +json.confirmations;
    this.outputs = json.outputs || [];

    this.isListingFee = this.category === 'internal_transfer' && this.outputs.length === 0;


    if (json.outputs && json.outputs.length) {
      const output = json.outputs[0];

      if (!output.stealth_address) {
        this.address = output.address;

        if (output.address && output.address.startsWith('r')) {
          this.addressType = AddressType.MULTISIG;
        } else {
          this.addressType = AddressType.NORMAL;
        }

      } else {
        this.address = output.stealth_address;
        this.addressType = AddressType.STEALTH;
      }
    }


    let narr = '';
    for (const output in this.outputs) {
      if (this.outputs[output] && this.outputs[output].narration) {
        narr = this.outputs[output].narration;
        break;
      }
    }
    this.narration = narr;


    if (this.category !== 'internal_transfer') {
      this.transferType = TxTransferType.NONE;
    } else {
      let transfer = 'tx split';
      for (const output of this.outputs) {
        if (typeof output.type === 'string' && output.type.length) {
            transfer = output.type; // 'standard' or 'blind' or 'anon'
          break;
        }
      }

      switch (transfer) {
        case 'standard':
          this.transferType = TxTransferType.PUBLIC;
          break;

        case 'blind':
          this.transferType = TxTransferType.BLIND;
          break;

        case 'anon':
          this.transferType = TxTransferType.ANON;
          break;
        default:
          this.transferType = TxTransferType.SPLIT;
      }
    }


    let netValue = this.amount;
    switch (true) {

      case +this.fee === 0:
        netValue = this.amount;
        break;

      case (this.category === 'internal_transfer') && !this.isListingFee:
        netValue = this.amount;
        break;

      default:
        const posFee = new PartoshiAmount(Math.abs(this.fee) * Math.pow(10, 8));
        const calcNet = this.fee > 0 ?
          (new PartoshiAmount(Math.abs(this.amount) * Math.pow(10, 8))).subtract(posFee).particls() :
          (new PartoshiAmount(Math.abs(this.amount) * Math.pow(10, 8))).add(posFee).particls();

        netValue = this.amount > 0 ? calcNet : +`-${calcNet}`;
        break;
    }
    this.netAmount = netValue;
  }
}
