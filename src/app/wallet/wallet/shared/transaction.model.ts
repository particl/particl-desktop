import { Amount, DateFormatter } from '../../../core/util/utils';
import { AddressType } from './address.model';

export type TransactionCategory =
    'all'
    | 'stake'
    | 'coinbase'
    | 'send'
    | 'receive'
    | 'orphaned_stake'
    | 'internal_transfer'
    | 'multisig'
    | 'listing_fee';

export class Transaction {

  type: string;

    txid: string;
    address: string ;
    stealth_address: string;
    label: string;
    category: TransactionCategory;
    amount: number;
    reward: number;
    fee: number;
    time: number;
    comment: string;
    n0: string;
    n1: string;

    outputs: any[];

    /* conflicting txs */
    walletconflicts: any[];

    /* block info */
    blockhash: string;
    blockindex: number;
    blocktime: number;
    confirmations: number;

  constructor(json: any) {
    /* transactions */
    this.txid = json.txid;
    if (json.outputs && json.outputs.length) {
      this.address = json.outputs[0].address;
      this.stealth_address = json.outputs[0].stealth_address;
      this.label = json.outputs[0].label;
    }
    this.category = json.category;
    this.amount = json.amount;
    this.reward = json.reward;
    this.fee = json.fee;
    this.time = json.time;
    this.comment = json.comment;
    this.n0 = json.n0;
    this.n1 = json.n1;

    this.outputs = json.outputs;

    /* conflicting txs */
    this.walletconflicts = json.walletconflicts;

    /* block info */
    this.blockhash = json.blockhash;
    this.blockindex = json.blockindex;
    this.blocktime = json.blocktime;
    this.confirmations = json.confirmations;
  }

  public getAddress(): string {
    if (this.stealth_address === undefined) {
      return this.address;
    }
    return this.stealth_address;
  }

  private getAddressType(): AddressType {
    if (this.stealth_address === undefined) {
      if (this.address && this.address.startsWith('r')) {
        return AddressType.MULTISIG;
      }
      return AddressType.NORMAL;
    } else {
      return AddressType.STEALTH;
    }
  }

  public isMultiSig(): boolean {
    return this.getAddressType() === AddressType.MULTISIG;
  }

  public isListingFee(): boolean {
    return this.category === 'internal_transfer' && this.outputs.length === 0;
  }

  getCategory(): TransactionCategory {
    if (this.isMultiSig()) {
      return 'multisig';
    } else if (this.isListingFee()) {
      return 'listing_fee'
    } else {
      return this.category;
    }
  }

  public getExpandedTransactionID(): string {
    return this.txid + this.getAmountObject().getAmount() + this.category;
  }


  public getConfirmationCount(confirmations: number): string {
    if (this.confirmations > 12) {
      return '12+';
    }
    return this.confirmations.toString();
  }


  /* Amount stuff */
  public getAmount(): number {
   if (this.getCategory() === 'internal_transfer') {
      // add all elements in output array ( but exclude vout === 65535)
      // todo: check assumption that we own all outputs?
      /*
      const add = function (a: any, b: any) { return a + (b.vout === 65535 ? 0 : b.amount); }
      return this.outputs.reduce(add, 0);
      */

/*
      const blindStealthOutputCount = this.outputs.reduce(function (a: any, b: any) {
        return a + (b.vout !== 65535 ? (b.stealth_address !== undefined ? 1 : 0) : 0);
      }, 0);
      console.log("blind_stealth_address count: " + blindStealthOutputCount);

      // blind -> blind (own)
      if(blindStealthOutputCount === 1) {
        console.log("length should equal 2 =" + this.outputs.length);
        const add = function (a: any, b: any) { return a + (b.stealth_address !== undefined ? b.amount : 0); }
        console.log("returning shoud be 0.5 =  " + this.outputs.reduce(add, 0));
        return this.outputs.reduce(add, 0);
      } */

      // only use fake output to determine internal transfer
      const fakeOutput = function (a: any, b: any) { return a - (b.vout === 65535 ? b.amount : 0); }
      return this.outputs.reduce(fakeOutput, 0);
    } else if (this.getCategory() === 'multisig') {
      const amount: number = this.outputs.find(output => output.address.startsWith('r')).amount;
      return amount;
    } else {
      return +this.amount;
    }
  }

  /** Turns amount into an Amount Object */
  public getAmountObject(): Amount {
    return new Amount(this.getAmount());
  }

  /** Calculates the actual amount that was transfered, including the fee */
  /* todo: fee is not defined in normal receive tx, wut? */
  public getNetAmount(): number {
    const amount: number = +this.getAmountObject().getAmount();
    // @ TODO: the fee for multisig transaction includes the change
    /* If fee undefined then just return amount */
    if (this.fee === undefined) {
      return amount;
    /* sent */
    } else if (amount < 0) {
      return new Amount(+amount + (+this.fee)).getAmount();
    } else {
      return new Amount(+amount - (+this.fee)).getAmount();
    }
  }



  /* Date stuff */
  public getDate(): string {
    return new DateFormatter(new Date(this.time * 1000)).dateFormatter();
  }

  /* Narration */
  public getNarration() {
    for (const key in this.outputs) {
      if (this.outputs[key] && this.outputs[key].narration) {
        return this.outputs[key].narration;
      }
    }
    return false
  }


}
