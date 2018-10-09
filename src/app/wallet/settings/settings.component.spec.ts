import { Location } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SharedModule } from '../shared/shared.module';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CoreModule } from 'app/core/core.module';
import { HttpClientModule } from '@angular/common/http';

import { SettingsService } from './settings.service';

import { SettingsComponent } from './settings.component';
import { SettingsModule } from 'app/wallet/settings/settings.module';
import { Settings } from 'app/wallet/settings/models/settings.model';
import { DEFAULT_GUI_SETTINGS } from 'app/core/util/utils';
import { ModalsModule } from 'app/modals/modals.module';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreUiModule.forRoot(),
        RouterTestingModule,
        SharedModule,
        HttpClientModule,
        CoreModule.forRoot(),
        BrowserAnimationsModule,
        SettingsModule.forRoot(),
        ModalsModule.forRoot()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    const settingService = TestBed.get(SettingsService);
    settingService.init();
    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
/*
  it('should go to settingsTab', () => {
    // component.settingsTab();
    expect(component.settings).toBeTruthy();
  });

  it('should applySettings', () => {
    component.apply();
    expect(component.apply).toBeTruthy();
  });

  it('should cancel', () => {
    component.cancel();
    expect(component.cancel).toBeTruthy();
  });

  it('should validate', () => {
    component.validate();
    expect(component.validate).toBeTruthy();
  });
*/
  it('should get settings', () => {
    expect(component.settings).toBeDefined();
  });

  it('should get tab', () => {
    expect(component.tab).toBe('main');
  });
});
