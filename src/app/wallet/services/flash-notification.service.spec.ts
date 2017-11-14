import { TestBed, inject } from '@angular/core/testing';
import {FlashNotificationService} from './flash-notification.service';
import { MdSnackBarModule } from '@angular/material';


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
