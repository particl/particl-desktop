
export const MADCT_ESCROW_PERCENTAGE_DEFAULT = 100;
export const MADCT_ESCROW_PERCENTAGE_MAX = 100;

export type SALES_TYPE = 'SALE';
export type ESCROW_TYPE = 'MAD_CT';
export type CURRENCY_TYPE = 'PART';
export type SHIPPING_AVAIL_TYPE = 'SHIPS' | 'DOES_NOT_SHIP' | 'ASK' | 'UNKNOWN';
export type IMAGE_PROTOCOL = 'REQUEST' | 'SMSG' | 'FILE';
export type IMAGE_ENCODING = 'BASE64';
export type IMAGE_VERSION = 'ORIGINAL' | 'RESIZED' | 'THUMBNAIL' | 'MEDIUM' | 'LARGE';

export enum MarketType {
  MARKETPLACE = 'MARKETPLACE',
  STOREFRONT = 'STOREFRONT',
  STOREFRONT_ADMIN = 'STOREFRONT_ADMIN'
}
export enum IMAGE_SEND_TYPE {
  FREE = '0201',
  PAID = '0300'
}
export enum ADDRESS_TYPES { SHIPPING_OWN = 'SHIPPING_OWN', SHIPPING_BID = 'SHIPPING_BID' }
export enum ESCROW_RELEASE_TYPE { ANON = 'anon', BLIND = 'blind' }
export enum COMMENT_TYPES {
  LISTINGITEM_QUESTION_AND_ANSWERS = 'LISTINGITEM_QUESTION_AND_ANSWERS'
}
export enum MARKET_REGION {
  WORLDWIDE = 'WORLDWIDE',
  EUROPE = 'EUROPE',
  ASIA_PACIFIC = 'ASIA_PACIFIC',
  MIDDLE_EAST_AFRICA = 'MIDDLE_EAST_AFRICA',
  NORTH_AMERICA = 'NORTH_AMERICA',
  SOUTH_AMERICA = 'SOUTH_AMERICA'
}
export enum BID_TYPES {
  SHIPPING_BID = 'SHIPPING_BID'
}
export enum ORDER_ITEM_STATUS {
  CREATED = 'BIDDED',
  ACCEPTED = 'AWAITING_ESCROW',
  ESCROW_REQUESTED = 'ESCROW_LOCKED',
  ESCROW_COMPLETED = 'ESCROW_COMPLETED',
  SHIPPED = 'SHIPPING',
  COMPLETE = 'COMPLETE',
  REJECTED = 'BID_REJECTED',
  CANCELLED = 'BID_CANCELLED'
}
export enum ORDER_STATUS {
  RECEIVED = 'RECEIVED',
  SENT = 'SENT',
  PROCESSING = 'PROCESSING',
  SHIPPING = 'SHIPPING',
  COMPLETE = 'COMPLETE',
  REJECTED = 'REJECTED'
}
export enum BID_STATUS {
  BID_CREATED = 'MPA_BID_03',
  BID_ACCEPTED = 'MPA_ACCEPT_03',
  ESCROW_REQUESTED = 'MPA_LOCK_03',
  ESCROW_COMPLETED = 'MPA_COMPLETE',
  ITEM_SHIPPED = 'MPA_SHIP',
  COMPLETED = 'MPA_RELEASE',
  BID_REJECTED = 'MPA_REJECT_03',
  ORDER_CANCELLED = 'MPA_CANCEL_03'
}
export enum BID_DATA_KEY {
  MARKET_KEY = 'market.address',
  ORDER_HASH = 'order.hash',
  ESCROW_MEMO = 'complete.memo',
  ESCROW_TX_ID = 'txid.complete',
  SHIPPING_MEMO = 'shipping.memo',
  RELEASE_MEMO = 'release.memo',
  RELEASE_TX_ID = 'txid.release',
  REJECT_REASON = 'reject.reason',
  DELIVERY_PHONE = 'delivery.phone',
  DELIVERY_EMAIL = 'delivery.email'
}
type CRYPTO_ADDRESS_TYPE = 'STEALTH';


interface RespGeneralProfile {
  id: number;
  name: string;
  imageId: null | number;
  updatedAt: number;
  createdAt: number;
}


interface RespGeneralIdentity {
  id: number;
  profileId: number;
  type: 'MARKET' | 'PROFILE';
  wallet: string;
  address: string;
  hdseedid: string;
  path: string;
  mnemonic: string | null;
  passphrase: string | null;
  imageId: number | null;
  updatedAt: number;
  createdAt: number;
  Profile: RespGeneralProfile;
  name: string;
}


interface GeneralBasicBid {
  id: number;
  msgid: string;
  type: BID_STATUS;
  bidder: string;
  hash: string;
  generatedAt: number;
  identityId: number;
  listingItemId: number;
  addressId: number;
  parentBidId: number | null;
  expiryTime: number | null;
  receivedAt: number;
  postedAt: number;
  expiredAt: number;
  updatedAt: number;
  createdAt: number;
}


interface GeneralChildBid extends GeneralBasicBid {
  BidDatas: {
    id: number;
    key: BID_DATA_KEY;
    value: string;
    bidId: number;
    updatedAt: number;
    createdAt: number;
  }[];
}


interface OrderBidItem extends GeneralChildBid {
  ChildBids: GeneralChildBid[];
  ListingItem: RespListingItem;
  ShippingAddress: {
    id: number;
    firstName: string;
    lastName: string;
    title: string | null;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    type: BID_TYPES;
    profileId: number;
    updatedAt: number;
    createdAt: number;
  };
}


interface RespGeneralBidItem extends GeneralChildBid {
  OrderItem: {
    id: number;
    status: ORDER_ITEM_STATUS,
    itemHash: string;
    orderId: number;
    bidId: number;
    updatedAt: number;
    createdAt: number;
    Order: {
      id: number;
      status: ORDER_STATUS;
      generatedAt: number;
      hash: string;
      buyer: string;
      seller: string;
      addressId: number;
      updatedAt: number;
      createdAt: number;
    }
  };
}


export interface PriceItem {
  whole: string;
  sep: string;
  fraction: string;
}


// tslint:disable:no-empty-interface
export interface RespProfileListItem extends RespGeneralIdentity {}
// tslint:enable:no-empty-interface


export interface RespIdentityListItem extends RespGeneralIdentity {
  ShoppingCarts: RespCartListItem[];
  Markets: RespIdentityMarketItem[];
}


export interface RespCategoryList {
  id: number;
  key: string;
  name: string;
  market: string;
  description: string;
  parentItemCategoryId: number | null;
  updatedAt: number;
  createdAt: number;
  ChildItemCategories?: RespCategoryList[];
}


export interface RespGeneralImageItem {
  id: number;
  hash: string;
  itemInformationId: null | number;
  featured: 0 | 1;
  ImageDatas: {
    id: number;
    protocol: IMAGE_PROTOCOL,
    encoding: IMAGE_ENCODING,
    imageVersion: IMAGE_VERSION,
    imageHash: string;
    dataId: string;
    data: null | string;
    imageId: number,
    updatedAt: number;
    createdAt: number;
    originalMime: string | null;
    originalName: string | null;
  }[];
}


export interface RespIdentityMarketItem {
  id: number;
  msgid: null | string;
  name: string;
  description: string;
  region: MARKET_REGION;
  type: MarketType;
  receiveKey: string;
  receiveAddress: string;
  publishKey: string;
  publishAddress: string;
  imageId?: null | number;
  hash: string;
  generatedAt: number;
  receivedAt: null | number;
  expiredAt: null | number;
  postedAt: null | number;
  updatedAt: number;
  createdAt: number;
  profileId: number;
  identityId: number;
  removed: 0 | 1;
}


export interface RespMarketListMarketItem extends RespIdentityMarketItem {
  FlaggedItem: {
    id: number;
    listingItemId: null;
    marketId: number;
    proposalId: number;
    reason: string;
    createdAt: number;
    updatedAt: number;
    Proposal?: Proposal;
  };
  Profile: RespGeneralProfile;
  Identity: any;
  Image?: null | {
    id: number;
    hash: string;
    itemInformationId: null | number;
    featured: 0 | 1;
    msgid: null | string;
    target: null | string;
    generatedAt: null | number;
    postedAt: null | number;
    receivedAt: null | number;
    updatedAt: number;
    createdAt: number;
    ImageDatas: {
      id: number;
      protocol: IMAGE_PROTOCOL;
      encoding: IMAGE_ENCODING;
      imageVersion: IMAGE_VERSION;
      imageHash: string;
      dataId: string;
      data: null | any;
      imageId: number;
      updatedAt: number;
      createdAt: number;
      originalMime: null | string;
      originalName: null | string;
    }[];
  };
}


interface TemplateItemCategory {
  id: number;
  key: string | null;
  name: string;
  market: number | null;
  description: string;
  parentItemCategoryId: number | null;
  updatedAt: number;
  createdAt: number;
  ParentItemCategory?: TemplateItemCategory;
}


export interface BasicLinkedTemplate {
  id: number;
  hash: string | null;
  market: string | null;
  generatedAt: number;
  profileId: number;
  parentListingItemTemplateId: number | null;
  updatedAt: number;
  createdAt: number;
  ChildListingItemTemplates?: BasicLinkedTemplate[];  // Only on a "market" template
}


export interface RespListingTemplateInformation {
  id: number;
  title: string;
  shortDescription: string;
  longDescription: string;
  itemCategoryId: number | null;
  listingItemId: number | null;
  listingItemTemplateId: number;
  updatedAt: number;
  createdAt: number;
  ItemLocation?: {
    id: number;
    country: string;
    address: string | null;
    description: string | null;
    itemInformationId: number;
    updatedAt: number;
    createdAt: number;
    LocationMarker: any;
  };
  ItemCategory?: TemplateItemCategory;
  Images?: RespGeneralImageItem[];
  ShippingDestinations?: {
    id: number;
    country: string;
    shippingAvailability: SHIPPING_AVAIL_TYPE;
    itemInformationId: number;
    updatedAt: number;
    createdAt: number;
  }[];
}


export interface RespListingTemplate {
  id: number;
  hash: string | null;
  market: string | null;
  generatedAt: number;
  profileId: number;
  parentListingItemTemplateId: number | null;
  updatedAt: number;
  createdAt: number;
  ItemInformation: RespListingTemplateInformation;
  PaymentInformation: {
    id: number;
    type: SALES_TYPE;
    listingItemId: number | null;
    listingItemTemplateId: number;
    updatedAt: number;
    createdAt: number;
    Escrow?: {
      id: number;
      type: ESCROW_TYPE;
      secondsToLock: number | null;
      releaseType: ESCROW_RELEASE_TYPE;
      paymentInformationId: number;
      updatedAt: number;
      createdAt: number;
      Ratio?: {
        id: number;
        buyer: number;
        seller: number;
        escrowId: number;
        updatedAt: number;
        createdAt: number;
      };
    };
    ItemPrice?: {
      id: number;
      currency: CURRENCY_TYPE;
      basePrice: number;
      paymentInformationId: number;
      cryptocurrencyAddressId: number | null,
      updatedAt: number;
      createdAt: number;
      ShippingPrice?: {
        id: number;
        domestic: number;
        international: number;
        itemPriceId: number;
        updatedAt: number;
        createdAt: number;
      };
    };
  };
  MessagingInformation: any[];
  ListingItemObjects: any[];
  ListingItems: RespListingItem[];
  Profile: RespGeneralProfile;
  ParentListingItemTemplate?: BasicLinkedTemplate;
  ChildListingItemTemplates: BasicLinkedTemplate[];
}


export interface RespItemPost {
  availableUtxos: number;
  error: string;
  fee?: number;
  result: string;  // Should be: 'Sent' | 'Not Sent'; but sometimes seems to include '.' characters sometimes not, etc
  totalFees: number;
  msgid?: string;
  txid?: string;
  tx_bytes?: number;
  childResults?: { result: string; fee: number; tx_bytes: number; }[];
}


export interface RespCategoryAdd {
  id: number;
  key: string;
  name: string;
  market: string;
  description: string;
  parentItemCategoryId: number;
  updatedAt: number;
  createdAt: number;
  ParentItemCategory: {
    id: number;
    key: string;
    name: string;
    market: string;
    description: string;
    parentItemCategoryId: number | null;
    updatedAt: number;
    createdAt: number;
  };
  ChildItemCategories: any[];
}


export interface RespTemplateSize {
  fits: boolean;
  identifier?: number;
  maxSize: string;
  messageVersion: IMAGE_SEND_TYPE;
  size: number;
  spaceLeft: number;
  childMessageSizes: RespTemplateSize[];
}


interface RespListingItemCategory {
  id: number;
  key: string;
  name: string;
  market: string;
  description: string;
  parentItemCategoryId: number | null;
  updatedAt: number;
  createdAt: number;
  ParentItemCategory?: RespListingItemCategory | null;
}


interface Proposal {
  id: number;
  msgid: string;
  market: string;
  submitter: string;
  hash: string;
  target: string;
  category: 'ITEM_VOTE' | 'PUBLIC_VOTE' | 'MARKET_VOTE';
  title: string;
  description: string;
  timeStart: number;
  postedAt: number;
  receivedAt: number;
  expiredAt: number;
  updatedAt: number;
  createdAt: number;
  proposalOptions: Array<{
    id: number;
    proposalId: number;
    optionId: number;
    description: 'KEEP' | 'REMOVE',
    hash: string;
    updatedAt: number;
    createdAt: number;
  }>;
}


interface RespListingItemFlagged {
  id: number;
  reason: string;
  listingItemId: number;
  proposalId: number;
  marketId: null;
  updatedAt: number;
  createdAt: number;
  Proposal: Proposal;
}


export interface RespListingItem {
  id: number;
  msgid: string;
  hash: string;
  seller: string;
  market: string;
  listingItemTemplateId: number;
  removed: 0 | 1;
  expiryTime: number;
  generatedAt: number;
  receivedAt: number;
  postedAt: number;
  expiredAt: number;
  updatedAt: number;
  createdAt: number;
  ItemInformation: {
    id: number;
    title: string;
    shortDescription: string;
    longDescription: string;
    itemCategoryId: number;
    listingItemId: number;
    listingItemTemplateId: number | null;
    updatedAt: number;
    createdAt: number;
    ItemCategory: RespListingItemCategory;
    ItemLocation: {
      id: number;
      country: string;
      address: string | null;
      description: string | null;
      itemInformationId: number;
      updatedAt: number;
      createdAt: number;
      LocationMarker: any;
    };
    Images: RespGeneralImageItem[];  // @TODO: Confirm this is the case
    ShippingDestinations: Array<{
      id: number;
      country: string;
      shippingAvailability: SHIPPING_AVAIL_TYPE;
      itemInformationId: number;
      updatedAt: number;
      createdAt: number;
    }>;
  };
  PaymentInformation: {
    id: number;
    type: SALES_TYPE;
    listingItemId: number;
    listingItemTemplateId: number | null;
    updatedAt: number;
    createdAt: number;
    Escrow: {
      id: number;
      type: ESCROW_TYPE;
      secondsToLock: number | null;
      releaseType: ESCROW_RELEASE_TYPE;
      paymentInformationId: number;
      updatedAt: number;
      createdAt: number;
      Ratio: {
        id: number;
        buyer: number;
        seller: number;
        escrowId: number;
        updatedAt: number;
        createdAt: number;
      }
    },
    ItemPrice: {
      id: number;
      currency: CURRENCY_TYPE;
      basePrice: number;
      paymentInformationId: number;
      cryptocurrencyAddressId: number;
      updatedAt: number;
      createdAt: number;
      ShippingPrice: {
        id: number;
        domestic: number;
        international: number;
        itemPriceId: number;
        updatedAt: number;
        createdAt: number;
      };
      CryptocurrencyAddress: {
        id: number;
        type: CRYPTO_ADDRESS_TYPE;
        address: string;
        profileId: number | null;
        updatedAt: number;
        createdAt: number;
      };
    };
  };
  MessagingInformation: any[];
  ListingItemObjects: any[];
  FavoriteItems: Array<{
    id: number;
    listingItemId: number;
    profileId: number;
    updatedAt: number;
    createdAt: number;
    Profile: RespGeneralProfile;
  }>;
  ListingItemTemplate?: null | {
    id: number;
    hash: string;
    market: string;
    generatedAt: number;
    profileId: number;
    parentListingItemTemplateId: number;
    updatedAt: number;
    createdAt: number;
    Profile: RespGeneralProfile;
  };
  Bids?: RespGeneralBidItem[];
  FlaggedItem?: RespListingItemFlagged;
}


export interface RespFavoriteItem {
  id: number;
  listingItemId: number;
  profileId: number;
  updatedAt: number;
  createdAt: number;
  ListingItem: RespListingItem;
  Profile: RespGeneralProfile;
}


export interface RespCartListItem {
  id: number;
  name: string;
  identityId: number;
  updatedAt: number;
  createdAt: number;
}


export interface RespCartGetItem {
  id: number;
  name: string;
  profileId: number;
  updatedAt: number;
  createdAt: number;
  Profile: RespGeneralProfile;
  ShoppingCartItems: Array<{
    id: number;
    shoppingCartId: number;
    listingItemId: number;
    updatedAt: number;
    createdAt: number;
    ListingItem: {
      id: number;
      msgid: string;
      hash: string;
      seller: string;
      market: string;
      listingItemTemplateId: number | null;
      removed: 0 | 1,
      expiryTime: number;
      generatedAt: number;
      receivedAt: number;
      postedAt: number;
      expiredAt: number;
      updatedAt: number;
      createdAt: number;
    };
  }>;
}


export interface RespCartItemAdd {
  id: number;
  shoppingCartId: number;
  listingItemId: number;
  updatedAt: number;
  createdAt: number;
  ShoppingCart: RespCartListItem;
  ListingItem: RespListingItem;
}


export interface RespItemFlag {
  result: string;
  msgid: string;
  txid: string;
  fee: number;
  tx_bytes: number;
  msgids: string[];
}


export interface RespVotePost {
  result: string;
  msgids: string[];
}


export interface RespVoteGet {
  id: number;
  voter: string;
  weight: number;
  postedAt: number;
  receivedAt: number;
  expiredAt: number;
  createdAt: number;
  updatedAt: number;
  proposalOptions: {
    id: number;
    proposalId: number;
    optionId: number;
    description: string;
    hash: string;
    Proposal: Proposal;
    Votes: any[];
    createdAt: number;
    updatedAt: number;
  }[];
  votedProposalOption: {
    id: number;
    proposalId: number;
    optionId: number;
    description: string;
    hash: string;
    Proposal: Proposal;
    Votes: any[];

    createdAt: number;
    updatedAt: number;
  };
}


export interface RespAddressAdd {
  id: number;
  firstName: string;
  lastName: string;
  title: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  type: ADDRESS_TYPES;
  profileId: number;
  updatedAt: number;
  createdAt: number;
  Profile: RespGeneralProfile;
}


export interface RespAddressListItem {
  id: number;
  firstName: string;
  lastName: string;
  title: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  type: ADDRESS_TYPES;
  profileId: number;
  updatedAt: number;
  createdAt: number;
}


export interface RespCartItemListItem {
  id: number;
  shoppingCartId: number;
  listingItemId: number;
  updatedAt: number;
  createdAt: number;
  ShoppingCart: RespCartListItem;
  ListingItem: RespListingItem;
}


export interface RespCommentListItem {
  id: number;
  msgid: string;
  parentCommentId: null | number;
  hash: string;
  sender: string;
  receiver: string;
  type: COMMENT_TYPES;
  target: string;
  message: string;
  generatedAt: number;
  postedAt: number;
  expiredAt: number;
  receivedAt: number;
  updatedAt: number;
  createdAt: number;
  ParentComment?: null | RespCommentListItem;
  ChildComments?: RespCommentListItem[];
}


export interface RespCommentPost {
  result: string;
  msgid: string;
}


export interface RespBidSearchItem extends RespGeneralBidItem {
  ShippingAddress: {
    id: number;
    firstName: string;
    lastName: string;
    title: null;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    type: BID_TYPES;
    profileId: number;
    updatedAt: number;
    createdAt: number;
    Profile: RespGeneralProfile;
  };
  ChildBids: GeneralChildBid[]; // contains updated bid messages (used when bid has progressed beyond initial state)
  ListingItem: RespListingItem;
  Identity: RespGeneralIdentity;
}


export interface RespOrderSearchItem {
  id: number;
  status: ORDER_STATUS;
  generatedAt: number;
  hash: string;
  buyer: string;
  seller: string;
  addressId: number;
  updatedAt: number;
  createdAt: number;
  OrderItems: {
      id: number;
      status: ORDER_ITEM_STATUS;
      itemHash: string;
      orderId: number;
      bidId: number;
      updatedAt: number;
      createdAt: number;
      Bid: OrderBidItem;
  }[];
  ShippingAddress: {
    id: number;
    firstName: string;
    lastName: string;
    title: string | null;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    type: BID_TYPES;
    profileId: number;
    updatedAt: number;
    createdAt: number;
    Profile: RespGeneralProfile;
  };
}

export interface RespProfileMnemonic {
  mnemonic: string;
  passphrase: string;
}
