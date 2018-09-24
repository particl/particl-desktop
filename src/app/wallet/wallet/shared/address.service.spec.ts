import { TestBed, inject } from '@angular/core/testing';

import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../shared/shared.module';

import { AddressService } from './address.service';

describe('AddressService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forRoot(),
        SharedModule
      ],
      providers: [AddressService]
    });
  });

  it('should ...', inject([AddressService], (service: AddressService) => {
    expect(service).toBeTruthy();
  }));
});
