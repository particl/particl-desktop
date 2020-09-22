import { environment } from 'environments/environment';
import { Observable, throwError, timer } from 'rxjs';
import { mergeMap, finalize } from 'rxjs/operators';


export class PartoshiAmount {

  private MAX_DECIMALS: number = 8;
  private DEC_SEP: string = '.';
  private amount: string = '0';

  constructor(amount: number, isPartoshiValue: boolean = false) {
    const num = isPartoshiValue ? Math.round(+amount) : Math.round((+amount * Math.pow(10, 8)));
    this.amount = this.isValid(num) ? `${num}` : this.amount;
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

  public multiply(num: number): PartoshiAmount {
    const total = Math.round(this.partoshis() * +num);
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

  public particlStringFraction(paddingCount: number = 0): string {
    const amount = this.calculateParticls().split(this.DEC_SEP)[1];
    const str = +amount > 0 ? amount.replace(/0+$/, '') : '';
    return paddingCount > 0 ? str.padEnd(paddingCount, '0').substring(0, paddingCount) : str;
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


export class AddressHelper {
  addressPublicRegex: RegExp = /^[pPrR25][a-km-zA-HJ-NP-Z1-9]{25,52}$/ ;
  addressPrivateRegex: RegExp = /^[Tt][a-km-zA-HJ-NP-Z1-9]{60,}$/ ;
  addressBothRegex: RegExp = /^[pPrR25tT][a-km-zA-HJ-NP-Z1-9]{25,}$/ ;

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
    );
  }

  public hourSecFormatter() {
      return (
        (this.date.getHours() < 10 ? '0' + this.date.getHours() : this.date.getHours()) + ':' +
        (this.date.getMinutes() < 10 ? '0' + this.date.getMinutes() : this.date.getMinutes()) + ':' +
        (this.date.getSeconds() < 10 ? '0' + this.date.getSeconds() : this.date.getSeconds())
      );
  }
}


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
};


export const genericPollingRetryStrategy = ({
  maxRetryAttempts = 3,
  scalingDuration = 1000,
  excludedStatusCodes = []
}: {
  maxRetryAttempts?: number,
  scalingDuration?: number,
  excludedStatusCodes?: number[]
} = {}) => (attempts: Observable<any>) => {
  return attempts.pipe(
    mergeMap((error, i) => {
      const retryAttempt = i + 1;
      // if maximum number of retries have been met
      // or response is a status code we don't wish to retry, throw error
      if (
        retryAttempt > maxRetryAttempts ||
        excludedStatusCodes.find(e => e === error.status)
      ) {
        return throwError(error);
      }
      console.log(
        `Attempt ${retryAttempt}: retrying in ${retryAttempt *
          scalingDuration}ms`
      );
      // retry after 1s, 2s, etc...
      return timer(retryAttempt * scalingDuration);
    }),
    finalize(() => console.log('We are done!'))
  );
};
