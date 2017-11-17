import { TestBed, inject } from '@angular/core/testing';
import { MdSnackBarModule } from '@angular/material';

import { FlashNotificationService } from './flash-notification.service';

describe('FlashNotificationServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MdSnackBarModule
      ],
      providers: [FlashNotificationService]
    });
  });

  it('should be created', inject([FlashNotificationService], (service: FlashNotificationService) => {
    expect(service).toBeTruthy();
  }));
});
