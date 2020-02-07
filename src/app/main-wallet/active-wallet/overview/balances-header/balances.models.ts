
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


export type ListUnspentType = 'listunspent' | 'listunspentblind' | 'listunspentanon';


export interface RpcUnspentBalanceUtxo {
  spendable?: boolean;
  coldstaking_address?: string;
  address: string;
  confirmations: number;
  amount: number;
}
