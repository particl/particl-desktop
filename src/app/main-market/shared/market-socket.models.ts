
export namespace SocketMessages_v03 {
  export interface AddListing {
    id: number;
    hash: string;
    seller: string;
    market: string;
  }
}


export interface SupportedMessageTypes {
  MPA_LISTING_ADD_03: SocketMessages_v03.AddListing;
}
