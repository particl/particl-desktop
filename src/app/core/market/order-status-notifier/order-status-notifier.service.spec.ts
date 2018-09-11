import { TestBed, inject } from '@angular/core/testing';
import { HttpClient, HttpClientModule } from '@angular/common/http';

import { OrderStatusNotifierService } from './order-status-notifier.service';
import { CoreModule } from 'app/core/core.module';

describe('OrderStatusNotifierService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        CoreModule.forRoot()
      ],
      providers: [OrderStatusNotifierService]
    });
  });

  it('should be created', inject([OrderStatusNotifierService], (service: OrderStatusNotifierService) => {
    expect(service).toBeTruthy();
  }));
});
