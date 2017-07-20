import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusComponent } from './status.component';

import { SharedModule } from '../../shared/shared.module';
import { ElectronService } from 'ngx-electron';

import { PeerService } from '../rpc/peer.service';
import { RPCService } from '../rpc/rpc.service';

describe('StatusComponent', () => {
  let component: StatusComponent;
  let fixture: ComponentFixture<StatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusComponent ],
      imports: [SharedModule],
      providers: [
        ElectronService,
        RPCService,
        PeerService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should getIconNumber', () => {
    component.getIconNumber();
    expect(component.getIconNumber).toBeTruthy();
  });

  it('should rpc_walletEncryptionStatus', () => {
    expect(component.rpc_walletEncryptionStatus).toBeTruthy();
  });

  it('should get encryptionStatus', () => {
    expect(component.encryptionStatus).toBe('_off');
  });
});
