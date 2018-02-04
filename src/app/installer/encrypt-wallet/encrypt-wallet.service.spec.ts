import { TestBed, inject } from '@angular/core/testing';

import { EncryptWalletService } from './encrypt-wallet.service';

describe('EncryptWalletService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EncryptWalletService]
    });
  });

  it('should be created', inject([EncryptWalletService], (service: EncryptWalletService) => {
    expect(service).toBeTruthy();
  }));
});
