import { PartoshiAmount } from 'app/core/util/utils';


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
    hash: string;
    marketKey: string;
    category: {
      id: number;
      name: string;
    }
  };
}

// import {
//   CURRENCY_TYPE,
//   ESCROW_TYPE,
//   ESCROW_RELEASE_TYPE,
//   SALES_TYPE,
//   SHIPPING_AVAIL_TYPE,
//   IMAGE_PROTOCOL,
//   IMAGE_ENCODING,
// } from '../shared/market.models';


// export interface ParamsNewTemplateDetails {
//   title: string;
//   summary: string;
//   description: string;
//   basePrice: number;
//   domesticShippingPrice: number;
//   foreignShippingPrice: number;
//   images: Array<{type: IMAGE_PROTOCOL, encoding: IMAGE_ENCODING, data: string}>;
//   shippingFrom: string;
//   shippingTo: string[];
//   salesType: SALES_TYPE;
//   currency: CURRENCY_TYPE;
//   escrowType: ESCROW_TYPE;
//   escrowBuyerRatio: 100;
//   escrowSellerRatio: 100;
//   escrowReleaseType: ESCROW_RELEASE_TYPE;
// }


// export interface ParamsUpdateTemplateDetails {
//   info?: {
//     title: string;
//     summary: string;
//     description: string;
//     category?: number | null;
//   };
//   images?: Array<{type: IMAGE_PROTOCOL, encoding: IMAGE_ENCODING, data: string}>;
//   payment?: {
//     salesType: SALES_TYPE;
//     currency: CURRENCY_TYPE;
//     basePrice: number;
//     domesticShippingPrice: number;
//     foreignShippingPrice: number;
//   };
//   shippingFrom?: string;
//   shippingTo?: {
//     add: string[],
//     remove: string[];
//   };
// }
