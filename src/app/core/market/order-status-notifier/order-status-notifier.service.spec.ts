import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { OrderStatusNotifierService } from './order-status-notifier.service';
import { CoreModule } from 'app/core/core.module';
import { MultiwalletModule } from 'app/multiwallet/multiwallet.module';
import { SettingsModule } from 'app/settings/settings.module';

describe('OrderStatusNotifierService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        CoreModule.forRoot(),
        MultiwalletModule.forRoot(),
        SettingsModule.forRoot()
      ],
      providers: [OrderStatusNotifierService]
    });
  });

  it('should be created', inject([OrderStatusNotifierService], (service: OrderStatusNotifierService) => {
    expect(service).toBeTruthy();
  }));
});
