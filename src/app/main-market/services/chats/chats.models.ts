export enum ChatChannelType {
  LISTINGITEM = 'LISTINGITEM',
  ORDERITEM = 'ORDER',
  OTHER = 'OTHER',
}


export enum ChatChannelTypeLabels {
  LISTINGITEM = 'Listing',
  ORDERITEM = 'Order',
  OTHER = 'Other / Unknown',
}



export interface ChatChannelDetails {
  newestReceived: number;
  lastRead: number;
}


export interface ChatChannel extends ChatChannelDetails {
  id: string;
  type: ChatChannelType;
}
