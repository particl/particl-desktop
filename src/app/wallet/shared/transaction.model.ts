import { Amount } from '../../shared/util/utils';

export type TransactionCategory = 'all' | 'stake' | 'coinbase' | 'send' | 'receive' | 'orphaned_stake';

export class Transaction {
  txid: string;
  address: string;
  stealth_address: string;
  type: string;
  category: string;
  amount: number;
  fee: number;
  reward: number;
  blockhash: string;
  blockindex: number;
  confirmations: number;
  time: number;
  comment: string;
  vout: number;
  walletconflicts: Object[];

  outputs: any[];

  constructor(
    txid: string,
    address: string,
    category: string,
    amount: number,
    reward: number,
    fee: number,
    blockhash: string,
    blockindex: number,
    confirmations: number,
    time: number, 
    comment: string) { }

  public getAddress(): string {
    if (this.stealth_address === undefined) {
      return this.address;
    }
    return this.stealth_address;
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
  /** Turns amount into an Amount Object */
  public getAmountObject(): Amount {
    if (this.category === 'stake') {
      return new Amount(+this.reward);
    } else {
      return new Amount(+this.amount);
    }
  }

  /** Calculates the actual amount that was transfered, including the fee */
  /* todo: fee is not defined in normal receive tx, wut? */
  public getNetAmount(): number {
    const amount: number = +this.getAmountObject().getAmount();

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
    return this.dateFormatter(new Date(this.time * 1000));
  }

  private dateFormatter(d: Date) {
    return (
      d.getDate() < 10 ? '0' + d.getDate() : d.getDate()) + '-' +
      ((d.getMonth() + 1) < 10 ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1)) + '-' +
      (d.getFullYear() < 10 ? '0' + d.getFullYear() : d.getFullYear()) + ' ' +
      (d.getHours() < 10 ? '0' + d.getHours() : d.getHours()) + ':' +
      (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()) + ':' +
      (d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds()
    );
  }


}

/*
    Deserialize JSON and cast it to a class of "type".
*/

export function deserialize(json: any): Transaction {
  /*
  txid: string,
    address: string,
    category: string,
    amount: number,
    reward: number,
    blockhash: string,
    blockindex: number,
    confirmations: number,
    time: number, 
    comment: string
  */

  /* transactions */
  const txid: string = json.txid;
  const address: string = json.outputs[0].address;
  const stealth_address: string = json.outputs[0].stealth_address;
  const label: string = json.outputs[0].label;
  const category: string = json.category;
  const amount: number = json.amount;
  const reward: number = json.reward;
  const time: number = json.time;
  const comment: string

  /* block info */
  const blockhash: string = json.blockhash;
  const blockindex: number = json.blockindex;
  const blocktime: number = json.blocktime;
  const confirmations: number = json.confirmations;

  const instance: Transaction = new Transaction();

  return instance;
}
