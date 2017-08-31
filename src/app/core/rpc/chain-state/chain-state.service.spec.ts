import { TestBed, inject } from '@angular/core/testing';

import { ChainStateService } from './chain-state.service';

describe('ChainStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChainStateService]
    });
  });

  it('should be created', inject([ChainStateService], (service: ChainStateService) => {
    expect(service).toBeTruthy();
  }));
});
