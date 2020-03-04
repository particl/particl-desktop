export interface IWallet {
  name: string;
  displayName: string;
  initial: string;
};


export interface IMenuItem {
  text: string;
  path: string;
  icon?: string;
  params?: any;
};
