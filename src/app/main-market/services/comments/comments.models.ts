
export interface ListingComment {
  hash: string;
  parentHash: null | string;
  childCount: number;
  created: number;
  sender: string;
  commentText: string;
}
