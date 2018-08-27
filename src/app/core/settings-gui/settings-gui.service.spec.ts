import { TestBed, inject } from '@angular/core/testing';

import { SettingsGuiService } from './settings-gui.service';
import { IpcService } from '../ipc/ipc.service';

describe('SettingsGuiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SettingsGuiService, IpcService]
    });
  });


  it('should be created', inject([SettingsGuiService], (service: SettingsGuiService) => {
    expect(service).toBeTruthy();
  }));
});
