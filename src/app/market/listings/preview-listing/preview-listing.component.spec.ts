import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { CoreModule } from 'app/core/core.module';
import { MarketModule } from '../../../core/market/market.module';
import { ModalsModule } from 'app/modals/modals.module';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';

import { ModalsHelperService } from 'app/modals/modals-helper.service';
import { CartService } from '../../../core/market/api/cart/cart.service';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';

import { PreviewListingComponent } from './preview-listing.component';

describe('PreviewListingComponent', () => {
  let component: PreviewListingComponent;
  let fixture: ComponentFixture<PreviewListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ PreviewListingComponent ],
      imports: [
        BrowserAnimationsModule,
        CoreUiModule.forRoot(),
        CoreModule.forRoot(),
        MarketModule.forRoot(),
        ModalsModule.forRoot(),
        RpcWithStateModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef},
        { provide: MAT_DIALOG_DATA, useValue: {} },
        CartService,
        SnackbarService,
        ModalsHelperService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
