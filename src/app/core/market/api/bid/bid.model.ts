import { OrderData, DateFormatter, PartoshiAmount } from 'app/core/util/utils';
import { Product } from './product.model';

export class Bid extends Product {
  activeBuySell: boolean;
  constructor(private order: any, private ordType: string ) {
    super();
    this.activeBuySell = (this.orderActivity.buttons || []).findIndex( (button: any) => button.action && !button.disabled) !== -1;
  }

  get id(): number {
    return this.order.id;
  }

  get type(): string {
    return this.ordType;
  }

  get listingItemId(): number {
    return this.order.listingItemId
  }

  get ShippingAddress(): any {
    return this.order.ShippingAddress;
  }

  get added(): string {
    return new DateFormatter(new Date(this.createdAt)).dateFormatter(false);
  }

  get updated(): string {
    return new DateFormatter(new Date(this.updatedAt)).dateFormatter(false);
  }

  get orderActivity(): any {
    const action = Object.keys(OrderData).find((key) => OrderData[key].orderStatus === this.allStatus);
    if (action) {
      return OrderData[action][this.ordType];
    }
    return {};
  }

  get OrderItem(): any {
    return this.order.OrderItem;
  }

  get ListingItem(): any {
    return this.order.ListingItem;
  }

  get allStatus(): string {
    return this.order.OrderItem.status ? this.order.OrderItem.status : this.order.type === 'MPA_REJECT' ? 'REJECTED' : 'BIDDED';
  }

  get createdAt(): number {
    return this.order.createdAt;
  }

  get updatedAt(): number {
    return this.order.updatedAt;
  }


  get hash(): string {
    if (this.order.ListingItem && this.order.ListingItem.hash) {
      return this.order.ListingItem.hash.substring(0, 3);
    }
    return '';
  }

  get hashDetail(): string {
    if (this.order.ListingItem && this.order.ListingItem.hash) {
      return this.order.ListingItem.hash.substring(0, 6);
    }
    return '';
  }

  get step(): string {
    return (Object.keys(OrderData).find((key) => OrderData[key].orderStatus === this.allStatus) || '').replace('_', ' ').toLowerCase();
  }


  PricingInformation(country: string): any {
    const payment = this.order.ListingItem.PaymentInformation;
    const itemPrice = payment.ItemPrice || {};
    const escrow = payment.Escrow || {};

    const isDomestic = this.isDomestic(country);
    const basePrice = new PartoshiAmount (itemPrice.basePrice || 0);

    // Calculate shipping
    const shippingPrice = (new PartoshiAmount(itemPrice.ShippingPrice[isDomestic ? 'domestic' : 'international'])).partoshis();

    // Calculate escrow
    const ratio = escrow.Ratio || {};
    const escrowPrice = basePrice.partoshis() + ((ratio.buyer || 0) / 100 * shippingPrice);

    // Calculate total
    const totalPrice = basePrice.partoshis() + shippingPrice + escrowPrice;

    return {
      base: basePrice,
      shipping: new PartoshiAmount(shippingPrice || 0),
      escrow: new PartoshiAmount(escrowPrice || 0),
      total: new PartoshiAmount(totalPrice || 0)
    };
  }

  private isDomestic(country: string): boolean {
    const itemLocation = this.ListingItem.ItemInformation.ItemLocation;
    if (itemLocation) {
      return itemLocation.country === country;
    }
    return false;
  }

}
