
interface ListingItemImage {
  readonly THUMBNAIL: string;
  readonly IMAGE: string;
}


interface ListingRegion {
  readonly code: string;
  readonly name: string;
}


export interface ListingItemDetail {
  readonly id: number;
  readonly marketId: number;
  readonly hash: string;
  readonly title: string;
  readonly summary: string;
  readonly description: string;
  readonly images: {
    readonly featured: number;
    readonly images: ListingItemImage[];
  };
  readonly price: {
    readonly base: number;
    readonly shippingDomestic: number;
    readonly shippingIntl: number;
  };
  readonly shippingFrom: ListingRegion;
  readonly shippingTo: ListingRegion[];
  readonly category: {
    readonly id: number;
    readonly title: string;
  };
  readonly seller: string;
  readonly timeData: {
    readonly expires: number;
    readonly created: number;
  };
  readonly escrow: {
    readonly buyerRatio: number;
    readonly sellerRatio: number;
  };
  readonly extra: {
    readonly flaggedProposal: string;
    readonly isOwn: boolean;
    readonly favouriteId: number;
  };
}
