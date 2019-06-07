import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreModule, BlockStatusService, PeerService } from 'app/core/core.module';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { ImportListingsComponent } from './import-listings.component';
import { ModalsHelperService } from 'app/modals/modals-helper.service';
import { RpcMockService } from 'app/_test/core-test/rpc-test/rpc-mock.service';
import { RpcStateServiceMock } from 'app/_test/core-test/rpc-test/rpc-state-mock.service';
import { RpcStateService } from 'app/core/rpc/rpc.module';
import { RpcService } from 'app/core/rpc/rpc.service';
import { MarketModule } from '../../../core/market/market.module';
import { ModalsModule } from 'app/modals/modals.module';

describe('ImportListingsComponent', () => {
  let component: ImportListingsComponent;
  let fixture: ComponentFixture<ImportListingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ 
        ImportListingsComponent 
      ],
      imports: [
        CoreUiModule.forRoot(),
        CoreModule.forRoot(),
        MarketModule.forRoot(),
        ModalsModule.forRoot(),
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: RpcStateService, useClass: RpcStateServiceMock },
        { provide: RpcService, useClass: RpcMockService },
        PeerService,
        BlockStatusService,
        ModalsHelperService
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportListingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
