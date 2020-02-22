
export interface Balance {
  id: string;
  type: string;
  label: string;
  description: string;
  amountWhole: string;
  amountSep: string;
  amountFraction: string;
  amount: number;
  isHorizontal: boolean;
}
