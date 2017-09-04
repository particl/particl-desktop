import { TestBed, inject } from '@angular/core/testing';

import { FlashNotificationServiceService } from './flash-notification-service.service';

describe('FlashNotificationServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlashNotificationServiceService]
    });
  });

  it('should be created', inject([FlashNotificationServiceService], (service: FlashNotificationServiceService) => {
    expect(service).toBeTruthy();
  }));
});
