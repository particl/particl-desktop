import { TestBed, inject } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material';

import { IpcService } from '../ipc/ipc.service';
import { UpdaterService } from './updater.service';


describe('UpdaterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ MatDialogModule ],
      providers: [UpdaterService, IpcService]
    });
  });

  it('should be created', inject([UpdaterService], (service: UpdaterService) => {
    expect(service).toBeTruthy();
  }));
});
