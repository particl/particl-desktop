import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CoreModule } from 'app/core/core.module';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MarketModule } from '../../../core/market/market.module';
import { ModalsModule } from 'app/modals/modals.module';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';

import { CategoryService } from '../../../core/market/api/category/category.service';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';
import { ModalsHelperService } from 'app/modals/modals-helper.service';

import { AddItemComponent } from './add-item.component';

describe('AddItemComponent', () => {
  let component: AddItemComponent;
  let fixture: ComponentFixture<AddItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddItemComponent ],
      imports: [
        CoreUiModule.forRoot(),
        CoreModule.forRoot(),
        ModalsModule.forRoot(),
        BrowserAnimationsModule,
        RouterTestingModule,
        MarketModule.forRoot(),
        RpcWithStateModule.forRoot()
      ],
      providers: [ CategoryService, SnackbarService, ModalsHelperService ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
