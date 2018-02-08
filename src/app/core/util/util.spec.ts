import { TestBed, inject } from '@angular/core/testing';

import { AddressHelper } from './utils';

describe('AddressHelper', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AddressHelper]
    });
  });

  it('should be created', inject([AddressHelper], (address: AddressHelper) => {
    expect(address).toBeTruthy();
  }));

  it('should test address', inject([AddressHelper], (addressHelper: AddressHelper) => {
    const address = 'pXvYNzP4UoW5UD2C27PzbFQ4ztG2W4Xakx';
    expect(addressHelper.testAddress(address, 'public')).toBe(true);
    expect(addressHelper.getAddress(address)).toEqual(address);
  }));

});
