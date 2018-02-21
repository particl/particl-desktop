import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { RpcModule } from '../rpc.module';
import { NewTxNotifierService } from './new-tx-notifier.service';
import { CoreModule } from 'app/core/core.module';

describe('NewTxNotifierService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        CoreModule.forRoot(),
        // RpcModule.forRoot()
      ],
      providers: [NewTxNotifierService]
    });
  });

  it('should be created', inject([NewTxNotifierService], (service: NewTxNotifierService) => {
    expect(service).toBeTruthy();
  }));
});
