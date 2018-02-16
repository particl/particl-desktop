import { TestBed, inject } from '@angular/core/testing';

import { ColdstakeService } from './coldstake.service';

describe('ColdstakeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ColdstakeService]
    });
  });

  it('should be created', inject([ColdstakeService], (service: ColdstakeService) => {
    expect(service).toBeTruthy();
  }));
});
