import { PriceItem } from '../../shared/market.models';


export enum TEMPLATE_STATUS_TYPE {
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
  PENDING = 'pending',
  EXPIRED = 'expired',
  ACTIVE = 'active'
}


export interface MarketTemplateOverview {
  id: number;
  title: string;
  category: string;
  marketKey: string;
  basePrice: string;
  listingsCount: number;
  hasHash: boolean;
  actions: {
    clone: boolean;
    edit: boolean;
    publish: boolean;
    delete: boolean;
  };
  expires: number;
  status: TEMPLATE_STATUS_TYPE | null;
}


export interface BaseTemplateOverview {
  id: number;
  title: string;
  summary: string;
  updatedLast: number;
  created: number;
  images: string[];
  basePrice: PriceItem;
  sourceLocation: string;
  shippingPriceLocal: PriceItem;
  shippingPriceIntl: PriceItem;
  marketTemplates: {
    templates: MarketTemplateOverview[];
    countActiveMarkets: number;
    countAllListings: number;
  };
  actions: {
    clone: boolean;
    edit: boolean;
    publish: boolean;
    delete: boolean;
  };
}
