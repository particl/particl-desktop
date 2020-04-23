import { TestBed, inject } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material';

import { IpcService } from 'app/core/ipc/ipc.service';
import { UpdaterService } from './updater.service';
import { CoreModule } from 'app/core/core.module';
import { HttpClientModule } from '@angular/common/http';
import { MultiwalletService } from 'app/multiwallet/multiwallet.service';
import { SettingsStateService } from 'app/settings/settings-state.service';


describe('UpdaterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        HttpClientModule,
        CoreModule.forRoot()
      ],
      providers: [UpdaterService, IpcService, MultiwalletService, SettingsStateService]
    });
  });

  it('should be created', inject([UpdaterService], (service: UpdaterService) => {
    expect(service).toBeTruthy();
  }));
});
