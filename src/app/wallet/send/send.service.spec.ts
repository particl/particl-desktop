import { TestBed, inject } from '@angular/core/testing';

import { SendService } from './send.service';

describe('SendService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SendService]
    });
  });

  it('should be created', inject([SendService], (service: SendService) => {
    expect(service).toBeTruthy();
  }));
});
