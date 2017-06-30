import { TestBed, inject } from '@angular/core/testing';

import { SendService } from './send.service';

describe('SendService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [
        SendService,
        AppService,
        ElectronService,
        RPCService
      ]
    });
  });

  it('should be created', inject([SendService], (service: SendService) => {
    expect(service).toBeTruthy();
  }));
});
