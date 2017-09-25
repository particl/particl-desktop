import { TestBed, inject } from '@angular/core/testing';

import { SettingsService } from './settings.service';
import { SettingsComponent } from './settings.component';

describe('SettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SettingsService]
    });
  });

  it('should ...', inject([SettingsService], (service: SettingsService) => {
    expect(service).toBeTruthy();
  }));
});
