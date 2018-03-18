export enum TxType {
  PUBLIC = 'part',
  BLIND = 'blind',
  ANON = 'anon'
}

export class TransactionBuilder {
  input: TxType;
  output: TxType;
  toAddress: string;
  toLabel: string;
  address: string;
  amount: number;
  comment: string;
  narration: string;
  numsignatures: number;
  validAddress: boolean;
  validAmount: boolean;
  isMine: boolean;
  currency: string;
  ringsize: number;
  subtractFeeFromAmount: boolean;
  note: string;
  transactionFee: number;

  constructor() {
    // set default value
    this.input = TxType.PUBLIC;
    this.output = TxType.BLIND;
    this.currency = 'part';
    this.ringsize = 8;
    this.subtractFeeFromAmount = false;
    this.numsignatures = 1;
  }
}
