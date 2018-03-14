export class TransactionBuilder {
  input: string;
  output: string;
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
    this.input = 'balance';
    this.output = 'blind_balance';
    this.currency = 'part';
    this.ringsize = 8;
    this.subtractFeeFromAmount = false;
    this.numsignatures = 1;
  }
}
