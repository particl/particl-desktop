import { PartoshiAmount } from 'app/core/util/utils';
import {
  CURRENCY_TYPE,
  ESCROW_TYPE,
  SALES_TYPE,
  SHIPPING_AVAIL_TYPE,
  IMAGE_PROTOCOL,
  IMAGE_ENCODING,
  IMAGE_VERSION
} from '../shared/market.models';


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


export interface TemplateImage {
  id: number;
  featured: boolean;
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
  linkedListingItems: any[];
}
