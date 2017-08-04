import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ElectronService } from 'ngx-electron';

import { SendComponent } from './send.component';

import { SharedModule } from '../../shared/shared.module';
import { WalletModule } from '../wallet.module';
import { RPCModule } from '../../core/rpc/rpc.service';

import { ModalsService } from '../../modals/modals.service';

describe('SendComponent', () => {
  let component: SendComponent;
  let fixture: ComponentFixture<SendComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
         SharedModule,
         WalletModule.forRoot()
      ],
      providers: [
        ElectronService,
        ModalsService,
        RPCService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
