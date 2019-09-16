import { environment } from '../../../environments/environment';

export class Amount {

  constructor(private amount: number, private maxRoundingDigits: number = 8) {
    this.amount = this.truncateToDecimals(amount, maxRoundingDigits);
  }

  public getAmount() {
    return this.amount;
  }

  public getAmountAsString() {
    const amount = this.amount.toFixed(this.maxRoundingDigits).replace(/0+$/, '');
    return amount[amount.length - 1] === '.' ? amount.replace('.', '') : amount;
  }

  public getAmountWithFee(fee: number) {
    const total = this.amount + fee;
    return this.truncateToDecimals(total, 8);
  }

  /**
   * Returns integer part.
   * e.g:
   * -25.9 -> '-25'
   * 25 -> '25'
   * 25.9 -> '25'
   */
  public getIntegerPart(): number {
    return Math.trunc(this.amount);
  }

  /**
   * Returns the integer part, with the correct signage;
   * Similar to getIntegerPart() but preserves negative signage for number -1 < x < 1
   */
  public getIntegerPartAsString(): string {
    return `${(this.amount < 0 ? '-' : '')}${Math.abs(Math.trunc(this.amount))}`;
  }

  /**
   * Returns fractional part.
   * e.g:
   * -25.9 -> '9'
   * 25 -> '0'
   * 25.9 -> '9'
   *
   * We have to return this as a string, else the leading zero's are gone.
   */
  public getFractionalPart(): string {
    if (this.ifDotExist()) {
      return (this.getAmountAsString()).split('.')[1];
    }
    return '';
  }

  /**
   * Returns a dot only when it exists in the number.
   * e.g:
   * -25.9 -> '.'
   * 25 -> ''
   * 25.9 -> '.'
   */
  dot(): string {
    return  this.ifDotExist() ? '.' : '';
  }

  ifDotExist(): boolean {
    return (this.getAmountAsString().toString()).indexOf('.') !== -1;
  }


  /**
   * Properly truncates the value.
   * e.g:
   * -25.99999 with dec=2 -> '-25.99'
   * 25 -> ''
   * 25.9 with dec=8 -> '25.9'
   * An upper limit of supported decimal places has been made. Reason for this is that there needs to be a distinction
   *  between (a) an explicit value of 0.199999999 truncated at 8 decimals,
   *  and     (b) a JS binary -> decimal floating point error from eg: (0.6 + 0.000002), truncated at 8 decimals
   *              (the dec representation of this calculation is 0.6000019999...)
   *  In the case of (a), the result should be 0.19999999 whereas in (b) it should be 0.600002 (not 0.60000199)
   *  Care needs to be taken that the value in (a) is not converted to 0.2 when truncated to a number of decimal places lower
   *    than currently "allocated". At the same time, (b) should be updated to be represented as 0.600002
   *  As a temporary measure, the max number of decimal places is fixed. It becomes the developer's responsibility at this point to ensure
   *    that any floating point value that has a number of decimal places greater than this is appropriately adjusted before creating
   *    an Amount from the value.
   */
  private truncateToDecimals(num: number, dec: number) {
    const maxDec = 12;
    const tmp = (+num).toFixed(maxDec);
    const val = tmp.substr(0, tmp.length - (maxDec - dec));
    return +val;
  }

  // Convert satoshi coins to original Part coins
  // @TODO (2019-05-28 zaSmilingIdiot): what is the purpose of this? Shouldn't the conversion occur before creating an amount value?
  //    Possible re-work required
  public getPartCoins() {
    if (this.ifDotExist()) {
      return this.amount;
    }
    return (this.amount) / Math.pow(10, 8);
  }

}

export class PartoshiAmount {

  private MAX_DECIMALS: number = 8;
  private DEC_SEP: string = '.';
  private amount: string = '0';

  constructor(amount: number) {
    const num = Math.floor(amount);
    this.amount = this.isValid(+num) ? `${num}` : this.amount;
  }

  public partoshis(): number {
    return +this.amount;
  }

  public particls(): number {
    return +this.calculateParticls();
  }

  public partoshisString(): string {
    return this.amount;
  }

  public particlsString(): string {
    const amount = this.calculateParticls().replace(/0+$/, '');
    return amount[amount.length - 1] === '.' ? amount.replace('.', '') : amount;
  }

  public add(other: PartoshiAmount): PartoshiAmount {
    const total = this.partoshis() + other.partoshis();

    if ( this.isValid(total)) {
      this.amount = `${total}`;
    }
    return this;
  }

  public subtract(other: PartoshiAmount): PartoshiAmount {
    const total = this.partoshis() - other.partoshis();

    if ( this.isValid(total)) {
      this.amount = `${total}`;
    } else {
      this.amount = '0';
    }
    return this;
  }

  public particlStringInteger(): string {
    return this.amount.length > this.MAX_DECIMALS ? this.amount.substr(0, this.amount.length - this.MAX_DECIMALS) : '0';
  }

  public particlStringFraction(): string {
    const amount = this.calculateParticls().split(this.DEC_SEP)[1];
    return +amount > 0 ? amount.replace(/0+$/, '') : '';
  }

  public particlStringSep(): string {
    return  this.particlStringFraction().length ? this.DEC_SEP : '';
  }

  private calculateParticls(): string {
    let whole = '0';
    let decimals = this.amount;
    if (this.amount.length > this.MAX_DECIMALS) {
      whole = this.amount.substr(0, this.amount.length - this.MAX_DECIMALS);
      decimals = this.amount.substr(this.amount.length - this.MAX_DECIMALS);
    }
    if (decimals.length < this.MAX_DECIMALS) {
      decimals = '0'.repeat(this.MAX_DECIMALS - decimals.length) + decimals;
    }
    return `${whole}${this.DEC_SEP}${decimals}`;
  }

  private isValid(amount: number): boolean {
    return (+amount <= Number.MAX_SAFE_INTEGER && +amount >= 0);
  }
}

export class Fee {
  private _fee: PartoshiAmount;
  constructor(private fee: number) {
    this._fee = new PartoshiAmount(fee * Math.pow(10, 8));
  }

  public getFee(): number {
    return this._fee.particls();
  }

  public getAmountWithFee(amount: number, isAddition: boolean = true): number {
    const total = new PartoshiAmount(amount * Math.pow(10, 8));
    if (isAddition) {
      return total.add(this._fee).particls();
    }
    return total.subtract(this._fee).particls();
  }
}

export class Duration {

  constructor(private duration: number) {
    /*
      test time formatter
      this.log.d(`setting expectedtime 1 year and 6 months = ${this.formatTime(47304000)}`);
      this.log.d(`setting expectedtime 10 months and 11 days = ${this.formatTime(27247838)}`);
      this.log.d(`setting expectedtime 1 minute = ${this.formatTime(60)}`);
    */
  }

  public getReadableDuration(): String {
    return this.formatTime(this.duration);
  }

  public getShortReadableDuration(): String {
    return this.shortFormatTime(this.duration);
  }

  // seconds into readable format
  private formatTime(seconds: number): String {
    const years: number = Math.floor(seconds / (60 /*s*/ * 60 /*min*/ * 24 /*hour*/ * 365/*days*/));
    const months: number =  Math.floor(seconds / (60 /*s*/ * 60 /*min*/ * 24 /*hours*/ * 30.5/*months*/)) - years * 12;
    const days: number =  Math.floor(seconds / (60 /*s*/ * 60 /*min*/ * 24/*hours*/)) - months * 30.5;
    const hours: number =  Math.floor(seconds / (60 /*s*/ * 60/*min*/)) - days * 24;
    const minutes: number =  Math.floor(seconds / (60/*s*/)) - hours * 60;

    if (years > 0) {
      return  years + ' years' + (months > 0 ? ' and ' + Math.ceil(months) + ' months' : '');
    } else if (months > 0) {
      return  months + ' months' + (days > 0 ? ' and ' + Math.ceil(days) + ' days' : '');
    } else if (days > 0) {
      return  days + ' days' + (hours > 0 ? ' and ' + Math.ceil(hours) + ' hours' : '');
    } else if (hours > 0) {
      return  hours + ' hours' + (minutes > 0 ? ' and ' + Math.ceil(minutes) + ' minutes' : '');
    } else if (minutes > 0) {
      return  minutes + (minutes > 1 ? ' minutes' : ' minute');
    } else {
      return 'less than a minute'
    }
  }

  // seconds into short & readable format
  private shortFormatTime(seconds: number): String {
    const years: number = Math.floor(seconds / (60 /*s*/ * 60 /*min*/ * 24 /*hour*/ * 365/*days*/));
    const months: number =  Math.floor(seconds / (60 /*s*/ * 60 /*min*/ * 24 /*hours*/ * 30.5/*months*/)) - years * 12;
    const days: number =  Math.floor(seconds / (60 /*s*/ * 60 /*min*/ * 24/*hours*/)) - months * 30.5;
    const hours: number =  Math.floor(seconds / (60 /*s*/ * 60/*min*/)) - days * 24;
    const minutes: number =  Math.floor(seconds / (60/*s*/)) - hours * 60;

    if (years > 0) {
      return  years + ' years';
    } else if (months > 0) {
      return  months + ' months';
    } else if (days > 0) {
      return  days + ' days';
    } else if (hours > 0) {
      return  hours + ' hours';
    } else if (minutes > 0) {
      return  minutes + ' minutes';
    } else if (seconds > 0) {
      return  '< 1 minute' ;
    }
    return 'unknown'
  }

  }

export class AddressHelper {
  addressPublicRegex: RegExp = /^[pPrR25][a-km-zA-HJ-NP-Z1-9]{25,52}$/;
  addressPrivateRegex: RegExp = /^[Tt][a-km-zA-HJ-NP-Z1-9]{60,}$/
  addressBothRegex: RegExp = /^[pPrR25tT][a-km-zA-HJ-NP-Z1-9]{25,}$/;

  testAddress(address: string, type?: string): boolean {
    return this[(type ? type === 'public'
    ? 'addressPublicRegex' : 'addressPrivateRegex' : 'addressBothRegex')].test(address);
  }

  getAddressType(address: string): string {
    return (this.testAddress(address) ?
      (this.testAddress(address, 'public') ? 'public' : 'private') :
      '');
  }

  getAddress(address: string): string {
    const match = address.match(this.addressBothRegex);
    return match ? match[0] : null;
  }

  addressFromPaste(event: any): string {
    return ['input', 'textarea'].includes(event.target.tagName.toLowerCase()) ?
      '' : this.getAddress(event.clipboardData.getData('text'));
  }
}

export class DateFormatter {

  constructor(private date: Date) {
  }

  public dateFormatter(onlyShowDate?: boolean) {
    return (
      (this.date.getDate() < 10 ? '0' + this.date.getDate() : this.date.getDate()) + '-' +
      ((this.date.getMonth() + 1) < 10 ? '0' + (this.date.getMonth() + 1) : (this.date.getMonth() + 1)) + '-' +
      this.date.getFullYear()
      + (onlyShowDate === false ?  ' ' + this.hourSecFormatter() : '')
    )
  }

  public hourSecFormatter() {
      return (
        (this.date.getHours() < 10 ? '0' + this.date.getHours() : this.date.getHours()) + ':' +
        (this.date.getMinutes() < 10 ? '0' + this.date.getMinutes() : this.date.getMinutes()) + ':' +
        (this.date.getSeconds() < 10 ? '0' + this.date.getSeconds() : this.date.getSeconds())
      )
  }
}

export function dataURItoBlob(dataURI: string) {
  const byteString = atob(dataURI.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], {type: 'image/jpeg'});
}

export const OrderData = {
  'BIDDING': {
    childBidStatus: {
      name: 'MPA_BID',
      order: 0
    },
    filter: {
      query: 'MPA_BID',
      text: 'Bids',
      order: 1
    },
    orderStatus: 'BIDDED',
    buy: {
      buttons: [
        {
          'tooltip': 'Cancel the bid request',
          'colour': 'warn',
          'disabled': false,
          'icon': 'part-cross',
          'text': 'Cancel bid',
          'action': 'CANCEL',
          'primary': false
        },
        {
          'tooltip': '',
          'colour': 'primary',
          'disabled': true,
          'icon': 'part-date',
          'text': 'Waiting for seller',
          'action': '',
          'primary': true
        }
      ],
      status_info: 'Waiting for Seller to manually accept (or reject) your bid',
      notifyOnEntry: false
    },
    sell: {
      buttons: [
        {
          'tooltip': 'Reject this bid, cancelling the order request',
          'colour': 'warn',
          'disabled': false,
          'icon': 'part-cross',
          'text': 'Reject bid & cancel order',
          'action': 'REJECT',
          'primary': false
        },
        {
          'tooltip': 'Approve this order and sell to this Buyer',
          'colour': 'primary',
          'disabled': false,
          'icon': 'part-check',
          'text': 'Accept bid',
          'action': 'ACCEPT',
          'primary': true
        }
      ],
      status_info: 'Buyer wants to purchase this item - approve or reject this order to continue',
      notifyOnEntry: true
    },
  },

  'REJECTED': {
    childBidStatus: {
      name: 'MPA_REJECT',
      order: 0
    },
    filter: {
      query: 'MPA_REJECT',
      text: 'Rejected',
      order: 10
    },
    from_action: 'REJECT',
    orderStatus: 'BID_REJECTED',
    buy: {
      buttons: [
        {
          'tooltip': '',
          'colour': 'primary',
          'disabled': true,
          'icon': 'part-error',
          'text': 'Order rejected',
          'action': '',
          'primary': true
        }
      ],
      status_info: 'Seller rejected bid on this item, order has been cancelled (no money was spent)',
      notifyOnEntry: true
    },
    sell: {
      buttons: [
        {
          'tooltip': '',
          'colour': 'primary',
          'disabled': true,
          'icon': 'part-error',
          'text': 'Rejected order',
          'action': '',
          'primary': true
        }
      ],
      status_info: 'You have rejected this bid, order has been cancelled',
      notifyOnEntry: false
    },
  },

  'PAYMENT': {
    childBidStatus: {
      name: 'MPA_ACCEPT',
      order: 1
    },
    filter: {
      query: 'AWAITING_ESCROW',
      text: 'Awaiting Payment',
      order: 2
    },
    from_action: 'ACCEPT',
    orderStatus: 'AWAITING_ESCROW',
    buy: {
      buttons: [
        {
          'tooltip': 'Cancel the bid request',
          'colour': 'warn',
          'disabled': false,
          'icon': 'part-cross',
          'text': 'Cancel bid',
          'action': 'CANCEL',
          'primary': false
        },
        {
          'tooltip': 'Pay for your order and escrow',
          'colour': 'primary',
          'disabled': false,
          'icon': 'part-check',
          'text': 'Make payment',
          'action': 'LOCK_ESCROW',
          'primary': true
        }
      ],
      status_info: 'Seller accepted your bid - please proceed to making the payment (this will lock the funds to escrow)',
      notifyOnEntry: true
    },
    sell: {
      buttons: [
        {
          'tooltip': 'Cancel the bid request',
          'colour': 'warn',
          'disabled': false,
          'icon': 'part-cross',
          'text': 'Cancel bid',
          'action': 'CANCEL',
          'primary': false
        },
        {
          'tooltip': 'Waiting for Buyer\'s Payment',
          'colour': 'primary',
          'disabled': true,
          'icon': 'part-date',
          'text': 'Waiting for Buyer',
          'action': '',
          'primary': true
        }
      ],
      status_info: 'Awaiting on buyer to lock funds in escrow',
      notifyOnEntry: false
    },
  },

  'ESCROW': {
    childBidStatus: {
      name: 'MPA_LOCK',
      order: 2
    },
    filter: {
      query: 'ESCROW_LOCKED',
      text: 'Escrow Lock',
      order: 3
    },
    from_action: 'LOCK_ESCROW',
    orderStatus: 'ESCROW_LOCKED',
    buy: {
      buttons: [
        {
          'tooltip': 'Cancel the bid request',
          'colour': 'warn',
          'disabled': false,
          'icon': 'part-cross',
          'text': 'Cancel bid',
          'action': 'CANCEL',
          'primary': false
        },
        {
          'tooltip': '',
          'colour': 'primary',
          'disabled': true,
          'icon': 'part-date',
          'text': 'Waiting for Seller',
          'action': '',
          'primary': true
        }
      ],
      status_info: 'Waiting on seller to complete escrow',
      notifyOnEntry: false
    },
    sell: {
      buttons: [
        {
          'tooltip': 'Cancel the bid request',
          'colour': 'warn',
          'disabled': false,
          'icon': 'part-cross',
          'text': 'Cancel bid',
          'action': 'CANCEL',
          'primary': false
        },
        {
          'tooltip': 'Pay for your escrow',
          'colour': 'primary',
          'disabled': false,
          'icon': 'part-check',
          'text': 'Complete escrow',
          'action': 'COMPLETE_ESCROW',
          'primary': true
        }
      ],
      status_info: 'Buyer has paid - please proceed to completing your escrow payment (this will lock the funds to escrow)',
      notifyOnEntry: true
    },
  },

  'PACKAGING': {
    childBidStatus: {
      name: 'MPA_COMPLETE',
      order: 3
    },
    filter: {
      query: 'ESCROW_COMPLETED',
      text: 'Packaging',
      order: 4
    },
    from_action: 'COMPLETE_ESCROW',
    orderStatus: 'ESCROW_COMPLETED',
    buy: {
      buttons: [
        {
          'tooltip': 'Shipment of item is pending',
          'colour': 'primary',
          'disabled': true,
          'icon': 'part-date',
          'text': 'Waiting for Seller',
          'action': '',
          'primary': true
        }
      ],
      status_info: 'Funds locked in escrow, waiting for Seller to process order for shipping',
      notifyOnEntry: true
    },
    sell: {
      buttons: [
        {
          'tooltip': 'Confirm that the order has been shipped to Buyer',
          'colour': 'primary',
          'disabled': false,
          'icon': 'part-check',
          'text': 'Mark as shipped',
          'action': 'SHIP_ITEM',
          'primary': true
        }
      ],
      status_info: 'Order is ready to ship - when sent, mark order as shipped and await its delivery',
      notifyOnEntry: false
    },
  },

  'SHIPPING': {
    childBidStatus: {
      name: 'MPA_SHIP',
      order: 4
    },
    filter: {
      query: 'SHIPPING',
      text: 'Shipping',
      order: 5
    },
    from_action: 'SHIP_ITEM',
    orderStatus: 'SHIPPING',
    buy: {
      buttons: [
        {
          'tooltip': 'Confirm that you have received the order',
          'colour': 'primary',
          'disabled': false,
          'icon': 'part-check',
          'text': 'Mark as delivered',
          'action': 'COMPLETE',
          'primary': true
        }
      ],
      status_info: 'Order has been shipped - when you receive it, mark it as delivered and the escrow funds will be released',
      notifyOnEntry: true
    },
    sell: {
      buttons: [
        {
          'tooltip': 'Awaiting confirmation of successfull delivery by Bbyer',
          'colour': 'primary',
          'disabled': true,
          'icon': 'part-date',
          'text': 'Waiting for delivery',
          'action': '',
          'primary': true
        }
      ],
      status_info: 'Order sent to buyer, waiting for buyer to confirm the delivery',
      notifyOnEntry: false
    },
  },

  'COMPLETE': {
    childBidStatus: {
      name: 'MPA_RELEASE',
      order: 5
    },
    filter: {
      query: 'COMPLETE',
      text: 'Complete',
      order: 6
    },
    from_action: 'COMPLETE',
    orderStatus: 'COMPLETE',
    buy: {
      buttons: [
        {
          'tooltip': '',
          'colour': 'primary',
          'disabled': true,
          'icon': 'part-check',
          'text': 'Order Complete',
          'action': '',
          'primary': true
        }
      ],
      status_info: 'Successfully finalized order',
      notifyOnEntry: false
    },
    sell: {
      buttons: [
        {
          'tooltip': '',
          'colour': 'primary',
          'disabled': true,
          'icon': 'part-check',
          'text': 'Order Complete',
          'action': '',
          'primary': true
        }
      ],
      status_info: 'Order delivery confirmed by Buyer - order successfully finalized',
      notifyOnEntry: true
    }
  },

  'CANCELLED': {
    childBidStatus: {
      name: 'MPA_CANCEL',
      order: 7
    },
    filter: {
      query: 'BID_CANCELLED',
      text: 'Cancelled',
      order: 11
    },
    from_action: 'BID_CANCELLED',
    orderStatus: 'BID_CANCELLED',
    buy: {
      buttons: [
        {
          'tooltip': '',
          'colour': 'primary',
          'disabled': true,
          'icon': 'part-error',
          'text': 'Order Cancelled',
          'action': '',
          'primary': true
        }
      ],
      status_info: 'Successfully cancelled order',
      notifyOnEntry: false
    },
    sell: {
      buttons: [
        {
          'tooltip': '',
          'colour': 'primary',
          'disabled': true,
          'icon': 'part-error',
          'text': 'Order Cancelled',
          'action': '',
          'primary': true
        }
      ],
      status_info: 'Order successfully cancelled',
      notifyOnEntry: true
    }
  }
};

export const isPrerelease = (release?: string): boolean => {
  let version = release;
  let found = false;
  const preParts = ['alpha', 'beta', 'RC'];
  if (!release) {
    version = environment.preRelease || environment.version;
  }

  for (const part of preParts) {
    if (version.includes(part)) {
      found = true;
      break;
    }
  }

  return found;
}

export const isMainnetRelease = (release?: string): boolean => {
  let version = release;
  if (!release) {
    version = environment.version;
  }

  return !version.includes('testnet');
}
