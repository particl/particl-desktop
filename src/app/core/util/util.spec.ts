import { TestBed, inject } from '@angular/core/testing';

import { AddressHelper, Amount, Duration, DateFormatter } from './utils';

describe('AddressHelper', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AddressHelper]
    });
  });

  it('should be created', inject([AddressHelper], (address: AddressHelper) => {
    expect(address).toBeTruthy();
  }));

  it('should test testnet address', inject([AddressHelper], (addressHelper: AddressHelper) => {
    const testAddress = 'pXvYNzP4UoW5UD2C27PzbFQ4ztG2W4Xakx';
    expect(addressHelper.testAddress(testAddress, 'public')).toBe(true);
    expect(addressHelper.getAddress(testAddress)).toEqual(testAddress);
  }));

  it('should test mainnet address', inject([AddressHelper], (addressHelper: AddressHelper) => {
    const mainAddress = 'PtF9rU2qR9JYBPvE3irVmeZn1YTsi3A9w9';
    expect(addressHelper.testAddress(mainAddress, 'public')).toBe(true);
    expect(addressHelper.getAddress(mainAddress)).toEqual(mainAddress);
  }));

});

describe('Amount', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Amount]
    });
  });
  const mockAmount = 5.6;
  const mockDescimalDigits = 10
  const amount = new Amount(mockAmount, mockDescimalDigits);

  const mockAmountTwo = 0.006;
  const amountTwo = new Amount(mockAmountTwo, 8);

  it('should be created', () => {
    expect(amount).toBeTruthy();
  });

  it('should return amount', () => {
    expect(amount.getAmount()).toEqual(mockAmount);
    expect(amount.getIntegerPart()).toEqual(5);
    expect(amount.getFractionalPart()).toEqual('6');
    expect(amount.positiveOrZero(-5)).toBe('0');
    expect(amount.dot()).toBe('.');
    expect(amount.truncateToDecimals(-25.99999, 3)).toEqual(-25.999);
  });


  it('should validate 0.001', () => {
    expect(amountTwo.getAmount()).toEqual(mockAmountTwo);
    expect(amountTwo.getIntegerPart()).toEqual(0);
    expect(amountTwo.getFractionalPart()).toEqual('006');
    expect(amountTwo.dot()).toBe('.');
  });

});

describe('Duration', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Duration]
    });
  });
  const mockRemainingTime = 2852457;
  const duration = new Duration(mockRemainingTime);
  it('should be created', () => {
    expect(duration).toBeTruthy();
  });

  it('should return duration', () => {
    expect(duration.getShortReadableDuration()).toEqual('1 months');
  });

});

describe('DateFormatter', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DateFormatter]
    });
  });
  const mockDate = new Date();
  const dateFormat = new DateFormatter(mockDate);
  it('should be created', () => {
    expect(dateFormat).toBeTruthy();
  });

});

