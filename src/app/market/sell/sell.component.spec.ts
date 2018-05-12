import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MarketModule } from '../../core/market/market.module';

import { TemplateService } from '../../core/market/api/template/template.service';
import { MarketService } from '../../core/market/market.service';
import { RpcStateService } from '../../core/rpc/rpc-state/rpc-state.service';

import { SellComponent } from './sell.component';

describe('SellComponent', () => {
  let component: SellComponent;
  let fixture: ComponentFixture<SellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SellComponent ],
      imports: [
        CoreUiModule.forRoot(),
        RouterTestingModule,
        BrowserAnimationsModule,
        MarketModule.forRoot()
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
