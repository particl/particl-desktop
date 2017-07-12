import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { ElectronService } from 'ngx-electron';

import { ModalsModule } from '../modals.module';

import { PeerService } from '../../core/rpc/peer.service';
import { RPCService } from '../../core/rpc/rpc.service';
import { StatusService } from '../../core/status/status.service';

import { RecoverwalletComponent } from './recoverwallet.component';

describe('RecoverwalletComponent', () => {
  let component: RecoverwalletComponent;
  let fixture: ComponentFixture<RecoverwalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        ModalsModule
      ],
      providers: [
        ElectronService,
        PeerService,
        RPCService,
        StatusService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecoverwalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
