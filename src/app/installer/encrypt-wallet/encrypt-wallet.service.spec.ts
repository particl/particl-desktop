import { TestBed, inject } from '@angular/core/testing';

import { CoreModule } from 'app/core/core.module';
import { RouterTestingModule } from '@angular/router/testing';

import { EncryptWalletService } from './encrypt-wallet.service';


describe('EncryptWalletService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EncryptWalletService],
      imports: [
        CoreModule.forRoot(),
        RouterTestingModule,
      ]
    });
  });

  it('should be created', inject([EncryptWalletService], (service: EncryptWalletService) => {
    expect(service).toBeTruthy();
  }));
});
