import { TestBed, inject } from '@angular/core/testing';

import { RpcModule } from '../rpc.module';
import { NewTxNotifierService } from './new-tx-notifier.service';

describe('NewTxNotifierService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RpcModule.forRoot()
      ],
      providers: [NewTxNotifierService]
    });
  });

  it('should be created', inject([NewTxNotifierService], (service: NewTxNotifierService) => {
    expect(service).toBeTruthy();
  }));
});
