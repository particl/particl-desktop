import { TestBed, inject } from '@angular/core/testing';

import { BidService } from './bid.service';

describe('BidService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BidService]
    });
  });

  it('should be created', inject([BidService], (service: BidService) => {
    expect(service).toBeTruthy();
  }));
});
