
export type AddressType = 'public' | 'private';
export type SelectableAddressType = AddressType | 'all';


export enum AddressFilterSortDirection {
  ASC = 0,
  DESC = 1
}


export enum AddressFilterOwnership {
  NO_FILTER = 0,
  OWNED = 1,
  NOT_OWNED = 2
}
