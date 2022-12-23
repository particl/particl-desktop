import { PartoshiAmount, DateFormatter } from 'app/core/util/utils';
import { RPCResponses } from 'app/networks/particl/particl.models';

export type CategoryFilterType = 'all' | RPCResponses.FilterTransactions.CategoryType;

export type SortFilterType = 'time' | 'amount' | 'address' | 'category' | 'confirmations' | 'txid';

export type TransactionFilterType = 'all' | RPCResponses.FilterTransactions.TransactionType;


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


export class FilteredTransaction {

  readonly txid: string;
  readonly address: string ;
  readonly category: RPCResponses.FilterTransactions.CategoryType;
  readonly amount: number;
  readonly amountWhole: string;
  readonly amountFraction: string;
  readonly netAmount: number;
  readonly reward: number;
  readonly fee: number;
  readonly time: number;
  readonly formattedTime: string;
  readonly requires_unlock: boolean;
  readonly outputs: RPCResponses.FilterTransactions.Output[];
  readonly confirmations: number;
  readonly addressType: AddressType;
  readonly transferType: TxTransferType;
  readonly requiredConfirmations: number;
  isAbandoned: boolean;

  readonly isListingFee: boolean;

  readonly narration: string;


  constructor(json: RPCResponses.FilterTransactions.Item) {

    this.isAbandoned = typeof json.abandoned === 'boolean' ? json.abandoned : false;

    /* transactions */
    this.txid = json.txid;
    this.category = json.category;
    if ((this.category === 'unknown' && json.type_in === 'anon')) {
      // caters for using anon funds for sending of smsg
      this.category = 'internal_transfer';
    }
    this.requiredConfirmations = 12;

    const partoshiAmount = new PartoshiAmount(Math.abs(+json.amount));
    this.amount = +json.amount;

    this.reward = +json.reward ? +json.reward : 0;
    this.fee = +json.fee ? +json.fee : 0;
    this.time = json.time;
    this.formattedTime = new DateFormatter(new Date(this.time * 1000)).dateFormatter(false);
    this.requires_unlock = json.requires_unlock ? json.requires_unlock : false;
    this.confirmations = +json.confirmations;
    this.outputs = json.outputs || [];

    this.isListingFee = (this.category === 'internal_transfer') && (this.outputs.length === 0);

    this.address = '';
    this.addressType = AddressType.NORMAL;
    if (json.outputs && json.outputs.length) {
      const output = json.outputs[0];

      if (!output.stealth_address) {
        this.address = output.address;

        if (output.address && output.address.startsWith('r')) {
          this.addressType = AddressType.MULTISIG;
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

    if ((this.transferType === TxTransferType.NONE) && (this.addressType === AddressType.NORMAL)) {
      this.requiredConfirmations = 1;
    }

    this.amountWhole = (
      this.amount < 0 ?
      '-' :
      (this.transferType === TxTransferType.NONE ? '+' : '')
    ) + partoshiAmount.particlStringInteger();

    this.amountFraction = partoshiAmount.particlStringFraction(4);


    let netValue = this.amount;
    switch (true) {

      case +this.fee === 0:
        netValue = this.amount;
        break;

      case (this.category === 'internal_transfer') && !this.isListingFee:
        const transferTotal = new PartoshiAmount(0, false);
        for (const output of this.outputs) {
          if ((Object.prototype.toString.call(output) === '[object Object]') && +output.amount > 0) {
            transferTotal.add(new PartoshiAmount(+output.amount, false));
          }
        }
        netValue = transferTotal.particls();
        break;

      default:
        const posFee = new PartoshiAmount(Math.abs(this.fee));
        const calcNet = this.fee > 0 ?
          (new PartoshiAmount(Math.abs(this.amount))).subtract(posFee).particls() :
          (new PartoshiAmount(Math.abs(this.amount))).add(posFee).particls();

        netValue = this.amount > 0 ? calcNet : +`-${calcNet}`;
        break;
    }
    this.netAmount = netValue;
  }
}
