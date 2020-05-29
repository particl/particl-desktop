
interface ListingItemImage {
  readonly THUMBNAIL: string;
  readonly IMAGE: string;
}


interface ListingRegion {
  readonly code: string;
  readonly name: string;
}


export interface ListingItem {
  readonly id: number;
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
  readonly market: {
    readonly id: number;
    readonly name: string;
  };
  readonly seller: string;
  timeData: {
    expires: number;
    created: number;
  };
  readonly escrow: {
    buyerRatio: number;
    sellerRatio: number;
  };
  readonly extra: {
    readonly isFlagged: boolean;
    readonly isOwn: boolean;
    readonly vote: {
      // TODO: details to be added when known
    };
  };
}
