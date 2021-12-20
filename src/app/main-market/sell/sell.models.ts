import { PartoshiAmount } from 'app/core/util/utils';
import { PriceItem } from '../shared/market.models';
import {
  CURRENCY_TYPE,
  ESCROW_TYPE,
  ESCROW_RELEASE_TYPE,
  SALES_TYPE,
  IMAGE_PROTOCOL,
} from '../shared/market.models';


export const PublishDurations = [
  { title: '1 day', value: 1 },
  { title: '2 days', value: 2 },
  { title: '4 days', value: 4 },
  { title: '1 week', value: 7 }
];


export enum PublishWarnings {
  INSUFFICIENT_UTXOS,
}


export enum TEMPLATE_STATUS_TYPE {
  UNKNOWN = 'unknown',
  UNPUBLISHED = 'unpublished',
  // published states next
  PENDING = 'pending',
  EXPIRED = 'expired',
  ACTIVE = 'active'
}


export interface TemplateFormDetails {
  title: string;
  summary: string;
  description: string;
  priceBase: string;
  priceShipLocal: string;
  priceShipIntl: string;
  shippingOrigin: string;
  escrowPercentageBuyer: number;
  escrowPercentageSeller: number;
  shippingDestinations: string[];
  savedImages: { id: number; url: string; }[];
  market: { selectedMarketId: number; canEdit: boolean; };
  category: { selectedMarketCategoryId: number; canEdit: boolean; };
  // pendingImages: base64-encoded images
  //  (primarily used for importing products, and should not be used for regular application usage of template forms)
  pendingImages?: string[];
}


export interface TemplateSavedDetails {
  title: string;
  summary: string;
  description: string;
  priceBase: PartoshiAmount;
  priceShippingLocal: PartoshiAmount;
  priceShippingIntl: PartoshiAmount;
  shippingOrigin: string;
  shippingDestinations: string[];
  images: {id: number; url: string}[];
  escrowSeller: number;
  escrowBuyer: number;
  escrowReleaseType: ESCROW_RELEASE_TYPE;
}


export interface Template {
  id: number;
  type: 'MARKET' | 'BASE';
  savedDetails: TemplateSavedDetails;
  baseTemplate: {
    id: number;
    marketHashes: string[];
  };
  marketDetails?: {
    marketKey: string;
    category: {
      id: number;
      name: string;
    }
  };
}


export interface TemplateRequestImageItem {
  type: IMAGE_PROTOCOL;
  data: string;
}


export interface CreateTemplateRequest {
  title: string;
  summary: string;
  description: string;
  priceBase: number;
  priceShippingLocal: number;
  priceShippingIntl: number;
  images: TemplateRequestImageItem[];
  shippingFrom: string;
  shippingTo: string[];
  salesType: SALES_TYPE;
  currency: CURRENCY_TYPE;
  escrowType: ESCROW_TYPE;
  escrowBuyerRatio: number;
  escrowSellerRatio: number;
  escrowReleaseType: ESCROW_RELEASE_TYPE;
  marketId: number | null;
  categoryId: number | null;
}


export interface UpdateTemplateRequest {
  cloneToMarket?: {
    marketId: number;
    categoryId: number;
  };
  info?: {
    title: string;
    summary: string;
    description: string;
    category?: number | null;
  };
  images?: TemplateRequestImageItem[];
  payment?: {
    salesType: SALES_TYPE;
    currency: CURRENCY_TYPE;
    basePrice: number;
    domesticShippingPrice: number;
    foreignShippingPrice: number;
  };
  escrow?: {
    buyerRatio: number;
    sellerRatio: number;
    escrowType: ESCROW_TYPE;
    releaseType: ESCROW_RELEASE_TYPE;
  };
  shippingFrom?: string;
  shippingTo?: {
    add: string[],
    remove: string[];
  };
}


export interface ProductMarketTemplate {
  id: number;
  title: string;
  image: string;
  marketKey: string;
  categoryName: string;
  categoryId: number;
  priceBase: PriceItem;
  priceShippingLocal: PriceItem;
  priceShippingIntl: PriceItem;
  hash: string;
  created: number;
  updated: number;
  status: TEMPLATE_STATUS_TYPE;
  listings: {
    count: number;
    latestExpiry: number;
  };
}


export interface ProductItem {
  // base template details
  id: number;
  title: string;
  summary: string;
  created: number;
  updated: number;
  images: string[];
  priceBase: PriceItem;
  priceShippingLocal: PriceItem;
  priceShippingIntl: PriceItem;
  sourceLocation: string;
  markets: ProductMarketTemplate[];
}


export interface BatchPublishProductItem {
  id: number;
  name: string;
  image: string;
  priceBase: string;
  priceShippingLocal: string;
  priceShippingIntl: string;
  existingMarkets: {
    marketId: number;
    categoryId: number;
    priceBase: string;
    priceShippingLocal: string;
    priceShippingIntl: string;
  }[];
}
