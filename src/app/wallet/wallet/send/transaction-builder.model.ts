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
  privacy: number;
  subtractFeeFromAmount: boolean;
  note: string;
  transactionFee: number;
}
