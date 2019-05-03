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
   * Returns zero if negative value.
   * Else return input value.
   * e.g:
   * -25.9 -> '0'
   * 25 -> '25'
   * 25.9 -> '25.9'
   */
  public positiveOrZero(int?: number) {
    if (int === undefined) {
      int = this.getAmount();
    }

    if (int < 0) {
      return '0';
    }

    return int;
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
   */
  truncateToDecimals(int: number, dec: number) {
    const calcDec = Math.pow(10, dec);
    return Math.trunc(int * calcDec) / calcDec;
  }

  // Convert satoshi coins to original Part coins
  public getPartCoins() {
    return (this.amount) / 100000000;
  }

}

export class Fee {
  constructor(private fee: number) {
    this.fee = this.truncateToDecimals(fee, 8);
  }

  public getFee(): number {
    return this.fee;
  }

  public getAmountWithFee(amount: number): number {
    const total = this.fee + amount;
    return this.truncateToDecimals(total, 8);
  }

  truncateToDecimals(int: number, dec: number): number {
    const calcDec = Math.pow(10, dec);
    return Math.trunc(int * calcDec) / calcDec;
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
    }
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
      (this.date.getFullYear() < 10 ? '0' + this.date.getFullYear() : this.date.getFullYear())
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

export const Messages = {
  'BIDDING': {
    'buy': {
      'action_button': 'Waiting for Seller',
      'tooltip': '',
      'action_disabled': true,
      'action_icon': 'part-date',
      'allow_reject_order': false,
      'status_info': 'Waiting for Seller to manually accept (or reject) your bid'
    },
    'sell': {
      'action_button': 'Accept bid',
      'tooltip': 'Approve this order and sell to this Buyer',
      'action_icon': 'part-check',
      'action_disabled': false,
      'allow_reject_order': true,
      'status_info': 'Buyer wants to purchase this item - approve or reject this order to continue'
    },
    'status' : 'bidding'
  },
  'REJECTED': {
    'buy': {
      'action_button': 'Order rejected',
      'tooltip': '',
      'action_disabled': true,
      'action_icon': 'part-error',
      'allow_reject_order': false,
      'status_info': 'Seller rejected bid on this item, order has been cancelled (no money was spent)'
    },
    'sell': {
      'action_button': 'Rejected order',
      'tooltip': '',
      'action_icon': 'part-error',
      'action_disabled': true,
      'allow_reject_order': false,
      'status_info': 'You have rejected this bid, order has been cancelled'
    },
    'status' : 'rejected'
  },
  'AWAITING_ESCROW': {
    'buy': {
      'action_button': 'Make payment',
      'tooltip': 'Pay for your order and escrow',
      'action_icon': 'part-check',
      'action_disabled': false,
      'allow_reject_order': false,
      'status_info': 'Seller accepted your bid - please proceed to making the payment (this will lock the funds to escrow)'
    },
    'sell': {
      'action_button': 'Waiting for Buyer',
      'tooltip': 'Waiting for Buyer\'s Payment',
      'action_icon': 'part-date',
      'action_disabled': true,
      'allow_reject_order': false,
      'status_info': 'Waiting for Buyer to lock the payment into escrow'
    },
    'status' : 'awaiting'
  },
  'ESCROW_LOCKED': {
    'buy': {
      'action_button': 'Waiting for shipping',
      'tooltip': '',
      'action_icon': 'part-date',
      'action_disabled': true,
      'allow_reject_order': false,
      'status_info': 'Funds locked in escrow, waiting for Seller to process order for shipping'
    },
    'sell': {
      'action_button': 'Mark as shipped',
      'tooltip': 'Confirm that the order has been shipped to Buyer',
      'action_icon': 'part-check',
      'action_disabled': false,
      'allow_reject_order': false,
      'status_info': `Buyer\'s funds are locked in escrow, order is ready to ship - when sent, Mark order as shipped and await its delivery`
    },
    'status' : 'escrow'
  },
  'SHIPPING': {
    'buy': {
      'action_button': 'Mark as delivered',
      'tooltip': 'Confirm that you have received the order',
      'action_icon': 'part-check',
      'action_disabled': false,
      'allow_reject_order': false,
      'status_info': 'Order has been shipped - when you receive it, Mark it as delivered and the escrow funds will be released'
    },
    'sell': {
      'action_button': 'Waiting for delivery',
      'tooltip': 'Awaiting confirmation of successfull delivery by Buyer',
      'action_icon': 'part-date',
      'action_disabled': true,
      'allow_reject_order': false,
      'status_info': 'Order sent to Buyer, waiting for Buyer to confirm the delivery'
    },
    'status' : 'shipping'
  },
  'COMPLETE': {
    'buy': {
      'action_button': 'Order complete',
      'tooltip': '',
      'action_icon': 'part-check',
      'action_disabled': true,
      'allow_reject_order': false,
      'status_info': 'Successfully finalized order'
    },
    'sell': {
      'action_button': 'Order Complete',
      'tooltip': '',
      'action_icon': 'part-check',
      'action_disabled': true,
      'allow_reject_order': false,
      'status_info': 'Order delivery confirmed by Buyer - order successfully finalized'
    },
    'status' : 'complete'
  }
}


export const isPrerelease = (release?: string): boolean => {
  let version = release;
  let found = false;
  if (!release) {
    version = environment.version;
  }
  const preParts = ['alpha', 'beta', 'RC'];

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
