import { TestBed, inject } from '@angular/core/testing';

import { CloseGuiService } from './close-gui.service';
import { IpcService } from '../ipc/ipc.service';

describe('CloseGuiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CloseGuiService, IpcService]
    });
  });


  it('should be created', inject([CloseGuiService], (service: CloseGuiService) => {
    expect(service).toBeTruthy();
  }));
});
