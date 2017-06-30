import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronService } from 'ngx-electron';

import { OverviewComponent } from './overview.component';

import { SharedModule } from '../shared/shared.module';
import { WalletModule } from '../wallet/wallet.module';
import { AppService } from '../app.service';
import { RPCService } from '../core/rpc/rpc.service';

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
         SharedModule,
         WalletModule.forRoot()
      ],
      declarations: [ OverviewComponent ],
      providers: [
        AppService,
        ElectronService,
        RPCService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
