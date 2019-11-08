import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';

import { SettingsComponent } from './settings.component';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { MaterialModule } from 'app/core-ui/material/material.module';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';
import { MultiwalletModule } from 'app/multiwallet/multiwallet.module';
import { CommonModule } from '@angular/common';
import { CoreModule } from 'app/core/core.module';
import { SettingsStateService } from './settings-state.service';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingsComponent ],
      imports: [
        CommonModule,
        SharedModule,
        MaterialModule,
        CoreModule.forRoot(),
        RouterTestingModule,
        RpcWithStateModule.forRoot(),
        MultiwalletModule.forRoot()
       ],
      providers: [SettingsStateService],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
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
});
