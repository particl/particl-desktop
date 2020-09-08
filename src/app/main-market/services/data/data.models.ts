import { MarketType } from '../../shared/market.models';


export interface CategoryItem {
  id: number;
  name: string;
  children: CategoryItem[];
}


export interface Market {
  id: number;
  name: string;
  type: MarketType;
  receiveAddress: string;
  identityId: number;
  image: string;
}


export interface Country {
  id: string;
  name: string;
}
