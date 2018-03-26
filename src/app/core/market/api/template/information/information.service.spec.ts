import { TestBed, inject } from '@angular/core/testing';

import { InformationService } from './information.service';

describe('InformationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [InformationService]
    });
  });

  it('should be created', inject([InformationService], (service: InformationService) => {
    expect(service).toBeTruthy();
  }));
});
