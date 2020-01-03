import { TestBed, inject } from '@angular/core/testing';

import { IpcService } from '../ipc/ipc.service';
import { ZmqService } from './zmq.service';

describe('ZmqService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ZmqService, IpcService]
    });
  });

  it('should be created', inject([ZmqService], (service: ZmqService) => {
    expect(service).toBeTruthy();
  }));
});
