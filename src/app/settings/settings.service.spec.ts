import { TestBed, inject } from '@angular/core/testing';

import { SettingsService } from './settings.service';
import { SettingsComponent } from './settings.component';

describe('SettingsService', () => {
  let component: SettingsComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      //declarations: [
        //SettingsComponent
      //],
      providers: [SettingsService]
    });
  });

  it('should ...', inject([SettingsService], (service: SettingsService) => {
    expect(service).toBeTruthy();
  }));
/*
  it('should go to settingsTab', () => {
    component.settingsTab;
    expect(component.settings).toBeTruthy();
  });

  it('should applySettings', () => {
    component.apply;
    expect(component.apply).toBeTruthy();
  });

  it('should cancel', () => {
    component.cancel;
    expect(component.cancel).toBeTruthy();
  });

  it('should validate', () => {
    component.validate;
    expect(component.validate).toBeTruthy();
  });

  it('should get settings', () => {
    expect(component.settings).toBe(undefined);
  });

  it('should get tab', () => {
    expect(component.tab).toBe('main');
  });
  */
});
