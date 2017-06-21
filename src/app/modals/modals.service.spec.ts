import { TestBed, inject } from '@angular/core/testing';

import { ModalsService } from './modals.service';

describe('ModalsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModalsService]
    });
  });

  it('should be created', inject([ModalsService], (service: ModalsService) => {
    expect(service).toBeTruthy();
  }));
});
