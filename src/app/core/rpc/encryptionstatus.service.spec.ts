import { TestBed, inject } from '@angular/core/testing';

import { EncryptionstatusService } from './encryptionstatus.service';

describe('EncryptionStatusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EncryptionStatusService]
    });
  });

  it('should be created', inject([EncryptionStatusService], (service: EncryptionStatusService) => {
    expect(service).toBeTruthy();
  }));
});
