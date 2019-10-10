import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { NewTxNotifierService } from './new-tx-notifier.service';
import { CoreModule } from 'app/core/core.module';
import { RpcWithStateModule } from '../rpc.module';
import { MultiwalletModule } from 'app/multiwallet/multiwallet.module';
import { SettingsModule } from 'app/settings/settings.module';

describe('NewTxNotifierService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        RpcWithStateModule.forRoot(),
        CoreModule.forRoot(),
        MultiwalletModule.forRoot(),
        SettingsModule.forRoot()
      ],
      providers: [NewTxNotifierService]
    });
  });

  it('should be created', inject([NewTxNotifierService], (service: NewTxNotifierService) => {
    expect(service).toBeTruthy();
  }));
});
