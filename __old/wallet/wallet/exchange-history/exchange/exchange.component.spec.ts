import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../../shared/shared.module';
import { RpcWithStateModule } from '../../../../core/rpc/rpc.module';
import { CoreModule } from '../../../../core/core.module';

import { ExchangeComponent } from './exchange.component';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { ModalsModule } from 'app/modals/modals.module';
import { RouterTestingModule } from '@angular/router/testing';
import { QRCodeModule } from 'angularx-qrcode';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


describe('ExchangeComponent', () => {
  let component: ExchangeComponent;
  let fixture: ComponentFixture<ExchangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExchangeComponent],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        ModalsModule.forRoot(),
        RpcWithStateModule.forRoot(),
        BrowserAnimationsModule,
        RouterTestingModule,
        QRCodeModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
