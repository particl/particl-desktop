import { PartoshiAmount } from 'app/core/util/utils';
import {
  CURRENCY_TYPE,
  ESCROW_TYPE,
  ESCROW_RELEASE_TYPE,
  SALES_TYPE,
  SHIPPING_AVAIL_TYPE,
  IMAGE_PROTOCOL,
  IMAGE_ENCODING,
} from '../shared/market.models';


export type TEMPLATE_SORT_FIELD_TYPE = 'item_informations.title' | 'created_at' | 'updated_at';

export enum TEMPLATE_TYPE {
  BASE,
  MARKET
}


export enum TEMPLATE_STATUS_TYPE {
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
  PENDING = 'pending',
  EXPIRED = 'expired'
}


export namespace TemplateDetails {
  export interface Information {
    id: number;
    title: string;
    summary: string;
    description: string;
  }


  export interface Pricing {
    id: number;
    currency: CURRENCY_TYPE;
    basePrice: PartoshiAmount;
    shippingLocal: PartoshiAmount;
    shippingInternational: PartoshiAmount;
  }


  export interface PaymentInfo {
    id: number;
    type: SALES_TYPE;
    escrow: {
      type: ESCROW_TYPE;
      buyerRatio: number;
      sellerRatio: number;
    };
  }


  export interface Location {
    id: number;
    countryCode: string;
  }


  export interface ShippingDestination {
    id: number;
    countryCode: string;
    type: SHIPPING_AVAIL_TYPE;
  }


  export interface Category {
    id: number;
    name: string;
  }


  export interface Image {
    id: number;
    featured: boolean;
    thumbnailUrl: string;
    imageUrl: string;
  }
}


interface Template {
  id: number;
  hash: string;   // NB! template cannot be modified if this value exists
  type: TEMPLATE_TYPE;
  details: {
    information: TemplateDetails.Information;
    shippingOrigin: TemplateDetails.Location;
    shippingDestinations: TemplateDetails.ShippingDestination[];
    images: TemplateDetails.Image[];
    price: TemplateDetails.Pricing;
    payment: TemplateDetails.PaymentInfo;
  };
  created: number;
  updated: number;
}


export interface BaseTemplate extends Template {
  type: TEMPLATE_TYPE.BASE;
  marketTemplates: MarketTemplate[];
}


export interface MarketTemplate extends Template {
  type: TEMPLATE_TYPE.MARKET;
  baseTemplateId: number;
  market: {
    id: number;
    key: string;
    name: string;
  };
  category: TemplateDetails.Category;
  status: TEMPLATE_STATUS_TYPE;
}


export interface ParamsNewTemplateDetails {
  title: string;
  summary: string;
  description: string;
  basePrice: number;
  domesticShippingPrice: number;
  foreignShippingPrice: number;
  images: Array<{type: IMAGE_PROTOCOL, encoding: IMAGE_ENCODING, data: string}>;
  shippingFrom: string;
  shippingTo: string[];
  salesType: SALES_TYPE;
  currency: CURRENCY_TYPE;
  escrowType: ESCROW_TYPE;
  escrowBuyerRatio: 100;
  escrowSellerRatio: 100;
  escrowReleaseType: ESCROW_RELEASE_TYPE;
}


export interface ParamsUpdateTemplateDetails {
  info?: {
    title: string;
    summary: string;
    description: string;
    category?: number | null;
  };
  images?: Array<{type: IMAGE_PROTOCOL, encoding: IMAGE_ENCODING, data: string}>;
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
