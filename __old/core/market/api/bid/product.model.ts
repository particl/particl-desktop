import { Listing } from '../listing/listing.model';

export class Product {
  id: number;
  listing: Listing;
  listingItemId: number;
  status: string;
  ListingItem: {
    seller: string
  };
  bidder: string;
  OrderItem: {
    status: string,
    id: number
  };
  ShippingAddress: {
    country: string
  };
  messages: {
    action_button: string,
    tooltip: string,
    action_disabled: boolean,
    action_icon: string,
    allow_reject_order: boolean,
    status_info: string
  }
}

