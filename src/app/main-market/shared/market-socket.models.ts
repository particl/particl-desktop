
export namespace SocketMessages_v03 {
  export interface AddListing {
    objectId: number;
    objectHash: string;
    from: string;  // seller
    market: string;
  }


  export interface ProposalAdded {
    category: 'PUBLIC_VOTE' | 'ITEM_VOTE' | 'MARKET_VOTE';
    objectHash: string;
    target: string | null;		// listingItem.hash if ProposalCategory.ITEM_VOTE
    market: string;
  }


  export interface CommentAdded {
    objectId: number;
    objectHash: string;
    target: string;     // if commentType === 'LISTINGITEM_QUESTION_AND_ANSWERS' then listingItem.hash
    from: string;     // sender's address
    to: string;   // if commentType === 'LISTINGITEM_QUESTION_AND_ANSWERS' then market.receiveAddress
    category: 'LISTINGITEM_QUESTION_AND_ANSWERS' | 'PROPOSAL_QUESTION_AND_ANSWERS' | 'MARKETPLACE_COMMENT' | 'PRIVATE_MESSAGE';
    parentObjectId?: number;
    parentObjectHash?: string;
  }


  export interface BidReceived {
    objectId: number;
    objectHash: string;
    market: string;  // market receive address
    from: string;  // sender
    target: string;  // listing item hash
    to: string;  // seller
  }

  export interface MarketAdded {
    objectId: number;
    objectHash: string;
  }
}


export interface SupportedMessageTypes {
  MPA_LISTING_ADD_03: SocketMessages_v03.AddListing;
  MPA_PROPOSAL_ADD: SocketMessages_v03.ProposalAdded;
  MPA_COMMENT_ADD: SocketMessages_v03.CommentAdded;
  MPA_BID_03: SocketMessages_v03.BidReceived;
  MPA_ACCEPT_03: SocketMessages_v03.BidReceived;
  MPA_REJECT_03: SocketMessages_v03.BidReceived;
  MPA_CANCEL_03: SocketMessages_v03.BidReceived;
  MPA_LOCK_03: SocketMessages_v03.BidReceived;
  MPA_RELEASE: SocketMessages_v03.BidReceived;
  MPA_SHIP: SocketMessages_v03.BidReceived;
  MPA_COMPLETE: SocketMessages_v03.BidReceived;
  MPA_MARKET_ADD: SocketMessages_v03.MarketAdded;
}
