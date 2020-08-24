import { PartoshiAmount } from 'app/core/util/utils';
import {
  CURRENCY_TYPE,
  ESCROW_TYPE,
  ESCROW_RELEASE_TYPE,
  SALES_TYPE,
  IMAGE_PROTOCOL,
  IMAGE_ENCODING,
} from '../shared/market.models';


export interface TemplateFormDetails {
  title: string;
  summary: string;
  description: string;
  priceBase: string;
  priceShipLocal: string;
  priceShipIntl: string;
  shippingOrigin: string;
  shippingDestinations: string[];
  savedImages: { id: number; url: string; }[];
  market: { selectedMarketId: number; canEdit: boolean; };
  category: { selectedMarketCategoryId: number; canEdit: boolean; };
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
  encoding: IMAGE_ENCODING;
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
  shippingFrom?: string;
  shippingTo?: {
    add: string[],
    remove: string[];
  };
}
