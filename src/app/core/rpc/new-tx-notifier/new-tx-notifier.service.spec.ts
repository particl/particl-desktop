import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { NewTxNotifierService } from './new-tx-notifier.service';
import { CoreModule } from 'app/core/core.module';
import { RpcWithStateModule } from '../rpc.module';

describe('NewTxNotifierService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        RpcWithStateModule.forRoot(),
        CoreModule.forRoot()
      ],
      providers: [NewTxNotifierService]
    });
  });

  it('should be created', inject([NewTxNotifierService], (service: NewTxNotifierService) => {
    expect(service).toBeTruthy();
  }));
});
