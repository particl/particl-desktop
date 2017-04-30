import { TestBed, inject } from '@angular/core/testing';

import { AddressTableService } from './address.table.service';

describe('AddressTableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AddressService]
    });
  });

  it('should ...', inject([AddressService], (service: AddressTableService) => {
    expect(service).toBeTruthy();
  }));
});
