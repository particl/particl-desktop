import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CoreModule } from 'app/core/core.module';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MarketModule } from '../../../core/market/market.module';
import { ModalsModule } from 'app/modals/modals.module';
import { SettingsModule } from 'app/settings/settings.module';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';

import { ModalsHelperService } from 'app/modals/modals-helper.service';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';

import { CommentsComponent } from './comments.component';
import { MultiwalletModule } from 'app/multiwallet/multiwallet.module';

describe('CommentsComponent', () => {
  let component: CommentsComponent;
  let fixture: ComponentFixture<CommentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        ModalsModule.forRoot(),
        MarketModule.forRoot(),
        RpcWithStateModule.forRoot(),
        MultiwalletModule.forRoot(),
        SettingsModule.forRoot()
      ],
      providers: [
        SnackbarService,
        ModalsHelperService
      ],
      declarations: [ CommentsComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentsComponent);
    component = fixture.componentInstance;
    component.pagination.infinityScrollSelector = '.comments-list';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
