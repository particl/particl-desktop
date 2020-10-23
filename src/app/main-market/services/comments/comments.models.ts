

export interface ListingItemComment {
  commentHash: string;
  listingHash: string;
  marketAddress: string;
  sender: {
    addressFull: string;
    addressShort: string;
  };
  created: number;
  isMine: boolean;
  isSeller: boolean;
  commentText: string;
  parentCommentId: number;
  children: ListingItemComment[];
}
