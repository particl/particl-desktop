import { TestBed, inject } from '@angular/core/testing';

import { SharedModule } from '../../shared/shared.module';
import { RpcModule, PassphraseService } from './rpc.module';

describe('PassphraseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcModule.forRoot()
      ],
    });
  });

  it('should be created', inject([PassphraseService], (service: PassphraseService) => {
    expect(service).toBeTruthy();
  }));
});
