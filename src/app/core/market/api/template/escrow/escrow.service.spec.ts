import { TestBed, inject } from '@angular/core/testing';

import { EscrowService } from './escrow.service';

describe('EscrowService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EscrowService]
    });
  });

  it('should be created', inject([EscrowService], (service: EscrowService) => {
    expect(service).toBeTruthy();
  }));
});
