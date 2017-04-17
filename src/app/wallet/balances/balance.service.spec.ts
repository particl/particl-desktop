import { TestBed, inject } from '@angular/core/testing';

import { BalanceService } from './balance.service';

describe('BalanceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BalanceService]
    });
  });

  it('should ...', inject([BalanceService], (service: BalanceService) => {
    expect(service).toBeTruthy();
  }));
});
