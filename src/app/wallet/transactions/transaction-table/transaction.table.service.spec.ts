import { TestBed, inject } from '@angular/core/testing';

import { TransactionsTableService } from './transaction.table.service';

describe('TransactionsTableService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TransactionsTableService]
    });
  });

  it('should ...', inject([TransactionsTableService], (service: TransactionsTableService) => {
    expect(service).toBeTruthy();
  }));
});
