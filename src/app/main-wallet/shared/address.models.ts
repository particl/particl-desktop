
export type AddressType = 'public' | 'private';
export type SelectableAddressType = AddressType | 'all';


export interface FilteredAddressCount {
  total: number;
  num_receive: number;
  num_send: number;
}


export interface FilteredAddress {
  address: string;
  label: string;
  owned: string;
  root: string;
  path?: string;
  id?: number;
}


export enum AddressFilterSortDirection {
  ASC = 0,
  DESC = 1
}


export enum AddressFilterOwnership {
  NO_FILTER = 0,
  OWNED = 1,
  NOT_OWNED = 2
}


export interface ValidatedAddress {
  isvalid: boolean;
  address: string;
  scriptPubKey: string;
  isscript: boolean;
  iswitness: boolean;
  witness_version?: number;
  witness_program?: string;
  isstealthaddress?: boolean;
}


export interface AddressInfo {
  address: string;
  label: string;
  scriptPubKey: string;
  ismine: boolean;
  iswatchonly: boolean;
  solvable: boolean;
  isscript: boolean;
  ischange: boolean;
  iswitness: boolean;
  witness_version?: number;
  witness_program?: string;
  script?: string;
  sigsrequired?: number;
  iscompressed?: boolean;
  hex?: string;
  pubkey?: string;
  pubkeys?: string[];
  labels?: Array<{name: string, purpose: 'send' | 'receive'}>;
  timestamp?: number;
}


export interface AddressAdded {
  result: 'success' | 'failed' | '';
  action: 'newsend';
  address: string;
  label: string;
}
