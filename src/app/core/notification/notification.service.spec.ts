import { TestBed, inject } from '@angular/core/testing';

import { NotificationService } from './notification.service';
import { IpcService } from '../ipc/ipc.service';

describe('NotificationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationService, IpcService]
    });
  });


  it('should be created', inject([NotificationService], (service: NotificationService) => {
    expect(service).toBeTruthy();
    service.sendNotification('test', 'arg2');
  }));
});
