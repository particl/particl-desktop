import { TestBed, inject } from '@angular/core/testing';
import {FlashNotificationService} from './flash-notification.service';


describe('FlashNotificationServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlashNotificationService]
    });
  });

  it('should be created', inject([FlashNotificationService], (service: FlashNotificationService) => {
    expect(service).toBeTruthy();
  }));
});
