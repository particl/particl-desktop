
export type AddressType = 'public' | 'private';


export interface FilteredAddressCount {
  total: number;
  num_receive: number;
  num_send: number;
};


export interface FilteredAddress {
  address: string;
  label: string;
  owned: string;
  root: string;
  path?: string;
  id?: number;
};


export enum AddressFilterSortDirection {
  ASC = 0,
  DESC = 1
};


export enum AddressFilterOwnership {
  NO_FILTER = 0,
  OWNED = 1,
  NOT_OWNED = 2
};
