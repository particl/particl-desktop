
export interface ListingOverviewItem {
  id: number;
  title: string;
  summary: string;
  hash: string;
  image: string;
  expiry: number;
  price: { whole: string; sep: string; decimal: string; };
  seller: string;
  extras: {
    isOwn: boolean;
    favouriteId: number | null;
    canAddToCart: boolean;
    isFlagged: boolean;
    commentCount: number;
  };
}
