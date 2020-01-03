import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from '../../shared/shared.module';
import { RpcWithStateModule } from '../../../core/rpc/rpc.module';
import { CoreModule } from '../../../core/core.module';

import { ExchangeHistoryComponent } from './exchange-history.component';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { ModalsModule } from 'app/modals/modals.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';


describe('ExchangeHistoryComponent', () => {
  let component: ExchangeHistoryComponent;
  let fixture: ComponentFixture<ExchangeHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExchangeHistoryComponent],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        ModalsModule.forRoot(),
        RpcWithStateModule.forRoot(),
        BrowserAnimationsModule,
        RouterTestingModule,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExchangeHistoryComponent);
    component = fixture.componentInstance;
    component.pagination.infinityScrollSelector = '.test-case-container';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
