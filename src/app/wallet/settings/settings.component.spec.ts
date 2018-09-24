import { Location } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { SharedModule } from '../shared/shared.module';

import { SettingsService } from './settings.service';

import { SettingsComponent } from './settings.component';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, SharedModule ],
      declarations: [ SettingsComponent ],
      providers: [ SettingsService, Location ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
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
