
export interface FavouritedListing {
  favouriteId: number;
  listingId: number;
  title: string;
  summary: string;
  hash: string;
  image: string;
  expiry: number;
  price: { whole: string; sep: string; decimal: string; };
  isOwn: boolean;
  canAddToCart: boolean;
}
