import { TestBed, inject } from '@angular/core/testing';

import { ZmqService } from './zmq.service';

describe('ZmqService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ZmqService]
    });
  });

  it('should be created', inject([ZmqService], (service: ZmqService) => {
    expect(service).toBeTruthy();
  }));
});
