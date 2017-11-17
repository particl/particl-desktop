import { TestBed, inject } from '@angular/core/testing';
import { MdSnackBarModule } from '@angular/material';

import { RpcModule } from '../../../core/rpc/rpc.module';
import { SharedModule } from '../../shared/shared.module';

import { SendService } from './send.service';
import { FlashNotificationService } from '../../services/flash-notification.service';
import { IpcService } from '../../../core/ipc/ipc.service';


describe('SendService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcModule.forRoot(),
        MdSnackBarModule
      ],
      providers: [SendService, FlashNotificationService, IpcService]
    });
  });

  it('should be created', inject([SendService], (service: SendService) => {
    expect(service).toBeTruthy();
  }));
});
