import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import { NewTxNotifierService } from './new-tx-notifier.service';
import { CoreModule } from 'app/core/core.module';
import { RpcWithStateModule } from '../rpc.module';
import { MultiwalletModule } from 'app/multiwallet/multiwallet.module';
import { SettingsModule } from 'app/settings/settings.module';
import { SettingsStateService } from 'app/settings/settings-state.service';

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
      providers: [NewTxNotifierService,  {provide: SettingsStateService, useClass: SettingsStateMockService}]
    });
  });

  it('should be created', inject([NewTxNotifierService], (service: NewTxNotifierService) => {
    expect(service).toBeTruthy();
  }));
});


@Injectable()
class SettingsStateMockService {

  public notifications: any = {
    'settings.wallet.notifications.payment_received': true,
    'settings.wallet.notifications.staking_reward': true
  };

  constructor() { }

  observe(field: string): Observable<any> {
    return Observable.create((observer: Observer<any>) => {
      observer.next(this.notifications[field] || false);
      observer.complete();
    });
  }
}
