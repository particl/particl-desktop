import { TestBed, inject } from '@angular/core/testing';

import { ConnectionCheckerService } from './connection-checker.service';

describe('ConnectionCheckerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConnectionCheckerService]
    });
  });

  it('should be created', inject([ConnectionCheckerService], (service: ConnectionCheckerService) => {
    expect(service).toBeTruthy();
  }));
});
