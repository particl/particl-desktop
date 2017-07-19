import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterTestingModule } from '@angular/router/testing';

import { Location, LocationStrategy } from '@angular/common';

import { SettingsComponent } from './settings.component';
import { SettingsService } from './settings.service';

import { SharedModule } from '../shared/shared.module';

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

  it('should go to settingsTab', () => {
    expect(component.settings).toBeTruthy();
  });

  it('should applySettings', () => {
    expect(component.apply).toBeTruthy();
  });

  it('should cancel', () => {
    expect(component.cancel).toBeTruthy();
  });

  it('should validate', () => {
    expect(component.validate).toBeTruthy();
  });

  it('should get settings', () => {
    expect(component.settings).toBeDefined();
  });

  it('should get tab', () => {
    expect(component.tab).toBe('main');
  });
});
