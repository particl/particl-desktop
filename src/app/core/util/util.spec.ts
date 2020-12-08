import {
  AddressHelper, PartoshiAmount, DateFormatter, isPrerelease
} from './utils';

describe('AddressHelper', () => {

  const addressHelper = new AddressHelper();
  const testAddressPub = 'pXvYNzP4UoW5UD2C27PzbFQ4ztG2W4Xakx' as 'public';
  const testAddressPriv = 'TetcFKJJHKD2zWxAmUz9VcsMogHUzntnEmTwLi3beFvVeQwLFtQGp5LywNQvZGs7GFxsD6zJUDxP84DGjng9ygyqn3zya4Emgyes86' as 'private';

  it('should validate a testnet address correctly', () => {
    expect(addressHelper.testAddress(testAddressPub, 'public')).toBe(true);
    expect(addressHelper.testAddress(testAddressPub, 'private')).toBe(false);
    expect(addressHelper.testAddress(testAddressPriv, 'public')).toBe(false);
    expect(addressHelper.testAddress(testAddressPriv, 'private')).toBe(true);
    expect(addressHelper.testAddress(testAddressPub)).toBe(true);
    expect(addressHelper.testAddress(testAddressPriv)).toBe(true);
    expect(addressHelper.getAddress(testAddressPub)).toEqual(testAddressPub);
    expect(addressHelper.getAddress(testAddressPriv)).toEqual(testAddressPriv);

    expect(addressHelper.getAddress('1234567890')).toEqual(null);
    expect(addressHelper.getAddress('')).toEqual(null);

    expect(addressHelper.getAddressType(testAddressPub)).toEqual('public');
    expect(addressHelper.getAddressType(testAddressPriv)).toEqual('private');
    expect(addressHelper.getAddressType('1234567890' as 'public')).toEqual('');
    expect(addressHelper.getAddressType('' as 'public')).toEqual('');
  });

  it('should validate a mainnet address correctly', () => {
    const mainAddress = 'PtF9rU2qR9JYBPvE3irVmeZn1YTsi3A9w9' as 'public';
    expect(addressHelper.testAddress(mainAddress, 'public')).toBe(true);
    expect(addressHelper.testAddress(mainAddress, 'private')).toBe(false);
    expect(addressHelper.testAddress(mainAddress)).toBe(true);
    expect(addressHelper.getAddress(mainAddress)).toEqual(mainAddress);
    expect(addressHelper.getAddressType(mainAddress)).toEqual('public');
  });

  it('should validate a pasted value', () => {
    const fakeInputEvent: any = {target: {tagName: 'input'}};
    const fakeClipboardEvent: any = {target: {tagName: 'text'}, clipboardData: {getData: function() { return testAddressPub; } }};
    expect(addressHelper.addressFromPaste(fakeInputEvent)).toBe('');
    expect(addressHelper.addressFromPaste(fakeClipboardEvent)).toBe(testAddressPub);
  });

});


describe('DateFormatter', () => {
  it('should return the correctly formatted date', () => {
    const df = new DateFormatter(new Date('2019-01-01 15:49:21 GMT+0'));
    expect(df.dateFormatter()).toBe('01-01-2019');
    expect(df.dateFormatter(true)).toBe('01-01-2019');
  });

  // NB: cannot test time values correctly, as the time (along with the date, to be more precise) is displayed in local time,
  //      and the result is dependent on the local timezone.

});


describe('Util Functions', () => {

  it('should return the correct pre-release status', () => {
    expect(isPrerelease('2.0.0-alpha')).toBe(true);
    expect(isPrerelease('2.0.0-beta')).toBe(true);
    expect(isPrerelease('2.0.0-RC')).toBe(true);
    expect(isPrerelease('alpha-2.0.0')).toBe(true);
    expect(isPrerelease('2.0.0-test')).toBe(false);
    expect(isPrerelease('2.0.0-testnet')).toBe(false);
    expect(isPrerelease('random-string')).toBe(false);
  });

  it('should return the correct mainnet release status', () => {
    expect(isMainnetRelease('application-testnet-1')).toBe(false);
    expect(isMainnetRelease('application-test')).toBe(true);
    expect(isMainnetRelease('application-alpha-testnet1')).toBe(false);
    expect(isMainnetRelease('application')).toBe(true);
    expect(isMainnetRelease('random-string')).toBe(true);
  });

  it('should return the correct blob data from a string input', () => {
    const result = dataURItoBlob('test, test');
    expect(result.size).toBe(3);
    expect(result.type).toBe('image/jpeg');
  });
});


describe('PartoshiAmount', () => {

  it('should validate numbers correctly', () => {
    let amount = new PartoshiAmount(100000000);
    expect(amount.partoshisString()).toBe('100000000');
    amount = new PartoshiAmount(12.5);
    expect(amount.partoshisString()).toBe('12');
    amount = new PartoshiAmount(-10);
    expect(amount.partoshisString()).toBe('0');
    amount = new PartoshiAmount(Number.MAX_SAFE_INTEGER);
    expect(amount.partoshisString()).toBe(`${Number.MAX_SAFE_INTEGER}`);
    amount = new PartoshiAmount(Number.MAX_SAFE_INTEGER + 1);
    expect(amount.partoshisString()).toBe('0');
    amount = new PartoshiAmount(1);
    expect(amount.partoshisString()).toBe('1');
    amount = new PartoshiAmount(0);
    expect(amount.partoshisString()).toBe('0');
  });

  it('should render the correct 0 value data', () => {
    const amount = new PartoshiAmount(0);
    expect(amount.partoshis()).toBe(0);
    expect(amount.partoshisString()).toBe('0');
    expect(amount.particlsString()).toBe('0');
    expect(amount.particls()).toBe(0);
    expect(amount.particlStringInteger()).toBe('0');
    expect(amount.particlStringFraction()).toBe('');
    expect(amount.particlStringSep()).toBe('');
  });

  it('should be define correctly from calculation inputs', () => {
    let amount = new PartoshiAmount(100 + 200);
    expect(amount.partoshis()).toBe(300);
    amount = new PartoshiAmount(99999999 + 1);
    expect(amount.partoshis()).toBe(100000000);
  });

  it('should return the correct string representation of the values', () => {
    let amount = new PartoshiAmount(1);
    expect(amount.partoshisString()).toBe('1');
    expect(amount.particlsString()).toBe('0.00000001');
    expect(amount.particlStringInteger()).toBe('0');
    expect(amount.particlStringFraction()).toBe('00000001');
    expect(amount.particlStringSep()).toBe('.');

    amount = new PartoshiAmount(100000000);
    expect(amount.partoshisString()).toBe('100000000');
    expect(amount.particlsString()).toBe('1');
    expect(amount.particlStringInteger()).toBe('1');
    expect(amount.particlStringFraction()).toBe('');
    expect(amount.particlStringSep()).toBe('');

    amount = new PartoshiAmount(100000001);
    expect(amount.partoshisString()).toBe('100000001');
    expect(amount.particlsString()).toBe('1.00000001');
    expect(amount.particlStringInteger()).toBe('1');
    expect(amount.particlStringFraction()).toBe('00000001');
    expect(amount.particlStringSep()).toBe('.');

    amount = new PartoshiAmount(12345678);
    expect(amount.partoshisString()).toBe('12345678');
    expect(amount.particlsString()).toBe('0.12345678');
    expect(amount.particlStringInteger()).toBe('0');
    expect(amount.particlStringFraction()).toBe('12345678');
    expect(amount.particlStringSep()).toBe('.');

    amount = new PartoshiAmount(1000);
    expect(amount.partoshisString()).toBe('1000');
    expect(amount.particlsString()).toBe('0.00001');
    expect(amount.particlStringInteger()).toBe('0');
    expect(amount.particlStringFraction()).toBe('00001');
    expect(amount.particlStringSep()).toBe('.');

    amount = new PartoshiAmount(110000000);
    expect(amount.partoshisString()).toBe('110000000');
    expect(amount.particlsString()).toBe('1.1');
    expect(amount.particlStringInteger()).toBe('1');
    expect(amount.particlStringFraction()).toBe('1');
    expect(amount.particlStringSep()).toBe('.');
  });

  it('should add other PartoshiAmounts correctly', () => {
    let amountBase = new PartoshiAmount(1);
    let amountOther = new PartoshiAmount(1);
    expect(amountBase.add(amountOther).partoshisString()).toBe('2');

    amountBase = new PartoshiAmount(Number.MAX_SAFE_INTEGER - 100);
    amountOther = new PartoshiAmount(101);
    expect(amountBase.add(amountOther).partoshisString()).toBe(`${Number.MAX_SAFE_INTEGER - 100}`);
  });
});
