import { TestBed, inject } from '@angular/core/testing';

import { SettingStateService } from './setting-state.service';

describe('SettingStateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SettingStateService]
    });
  });

  it('should be created', inject([SettingStateService], (service: SettingStateService) => {
    expect(service).toBeTruthy();
  }));
});
