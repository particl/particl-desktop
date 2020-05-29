import { PartoshiAmount } from 'app/core/util/utils';
import {
  CURRENCY_TYPE,
  ESCROW_TYPE,
  ESCROW_RELEASE_TYPE,
  SALES_TYPE,
  SHIPPING_AVAIL_TYPE,
  IMAGE_PROTOCOL,
  IMAGE_ENCODING,
  IMAGE_VERSION
} from '../shared/market.models';


export type TEMPLATE_SORT_FIELD_TYPE = 'item_informations.title' | 'created_at' | 'updated_at';


export enum TEMPLATE_STATUS_TYPE {
  PUBLISHED = 'published',
  UNPUBLISHED = 'unpublished',
  PENDING = 'pending',
  EXPIRED = 'expired'
}


export interface NewTemplateData {
  title: string;
  shortDescription: string;
  longDescription: string;
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


export interface UpdateTemplateData {
  info?: {
    title: string;
    shortDescription: string;
    longDescription: string;
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


export interface TemplateInformation {
  id: number;
  title: string;
  summary: string;
  description: string;
}


export interface TemplatePricing {
  id: number;
  currency: CURRENCY_TYPE;
  basePrice: PartoshiAmount;
  shippingLocal: PartoshiAmount;
  shippingInternational: PartoshiAmount;
}


export interface TemplatePaymentInfo {
  id: number;
  type: SALES_TYPE;
  escrow: {
    type: ESCROW_TYPE;
    buyerRatio: number;
    sellerRatio: number;
  };
}


export interface TemplateLocation {
  id: number;
  countryCode: string;
}


export interface TemplateShippingDestination {
  id: number;
  countryCode: string;
  type: SHIPPING_AVAIL_TYPE;
}


export interface TemplateCategory {
  id: number;
  name: string;
}


export interface TemplateImage {
  id: number;
  featured: boolean;
  thumbnailUrl: string;
  versions: Array<{
    id: number;
    version: IMAGE_VERSION;
    url: string;
    data: string;
  }>;
}


export interface ListingTemplate {
  id: number;
  profileId: number;
  hash: string;   // NB! template cannot be modified if this value exists
  information: TemplateInformation;
  location: TemplateLocation;
  shippingDestinations: TemplateShippingDestination[];
  images: TemplateImage[];
  price: TemplatePricing;
  payment: TemplatePaymentInfo;
  category: TemplateCategory;
  hasLinkedListings: boolean;
  status: TEMPLATE_STATUS_TYPE;
  created: number;
  updated: number;
}
