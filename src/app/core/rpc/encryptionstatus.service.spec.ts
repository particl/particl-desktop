import { TestBed, inject } from '@angular/core/testing';

import { SharedModule } from '../../shared/shared.module';
import { RpcModule, EncryptionStatusService } from './rpc.module';

describe('EncryptionStatusService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcModule.forRoot()
      ]
    });
  });

  it('should be created', inject([EncryptionStatusService], (service: EncryptionStatusService) => {
    expect(service).toBeTruthy();
  }));
});
