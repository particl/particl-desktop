import { TestBed, inject } from '@angular/core/testing';

import { MultiwalletService } from './multiwallet.service';

describe('MultiwalletService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MultiwalletService]
    });
  });

  it('should be created', inject([MultiwalletService], (service: MultiwalletService) => {
    expect(service).toBeTruthy();
  }));
});
