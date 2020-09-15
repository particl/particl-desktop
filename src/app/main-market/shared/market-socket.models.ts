
export namespace SocketMessages_v03 {
  export interface AddListing {
    id: number;
    hash: string;
    seller: string;
    market: string;
  }


  export interface ProposalAdded {
    category: 'PUBLIC_VOTE' | 'ITEM_VOTE' | 'MARKET_VOTE';
    hash: string;
    target: string | null;		// listingItem.hash if ProposalCategory.ITEM_VOTE
    market: string;
  }


  export interface CommentAdded {
    id: number;
    hash: string;
    target: string;
    sender: string;
    receiver: string;
    commentType: 'LISTINGITEM_QUESTION_AND_ANSWERS' | 'PROPOSAL_QUESTION_AND_ANSWERS' | 'MARKETPLACE_COMMENT' | 'PRIVATE_MESSAGE';
  }


  export interface BidReceived {
    id: number;
    hash: string;
    market: string;  // market receive address
  }
}


export interface SupportedMessageTypes {
  MPA_LISTING_ADD_03: SocketMessages_v03.AddListing;
  MPA_PROPOSAL_ADD: SocketMessages_v03.ProposalAdded;
  MPA_COMMENT_ADD: SocketMessages_v03.CommentAdded;
  MPA_BID_03: SocketMessages_v03.BidReceived;
}
