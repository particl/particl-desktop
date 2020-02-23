import { AddressType } from '../shared/address.models';


export type TabType = 'transfer' | 'send';
export type TxType = 'anon' | 'blind' | 'part';


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
}


export interface ValidatedAddress {
  isvalid: boolean;
  address: string;
  scriptPubKey: string;
  isscript: boolean;
  iswitness: boolean;
  witness_version?: number;
  witness_program?: string;
}


export interface SavedAddress {
  address: string;
  label: string;
  type: AddressType;
}
