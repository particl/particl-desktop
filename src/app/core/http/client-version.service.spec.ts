import { TestBed, inject } from '@angular/core/testing';

import { ClientVersionService } from './client-version.service';

describe('ClientVersionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClientVersionService]
    });
  });

  it('should be created', inject([ClientVersionService], (service: ClientVersionService) => {
    expect(service).toBeTruthy();
  }));
});
