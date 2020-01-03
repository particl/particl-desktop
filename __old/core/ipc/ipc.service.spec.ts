import { TestBed, inject } from '@angular/core/testing';

import { IpcService } from './ipc.service';

describe('IpcService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IpcService]
    });
  });

  it('should be created', inject([IpcService], (service: IpcService) => {
    expect(service).toBeTruthy();
  }));
});
