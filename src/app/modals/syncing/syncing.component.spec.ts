import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ElectronService } from 'ngx-electron';

import { SyncingComponent } from './syncing.component';

import { SharedModule } from '../../shared/shared.module';

import { RPCService } from '../../core/rpc/rpc.service';
import { PeerService } from '../../core/rpc/peer.service';
import { StatusService } from '../../core/status/status.service';

describe('SyncingComponent', () => {
  let component: SyncingComponent;
  let fixture: ComponentFixture<SyncingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule ],
      declarations: [ SyncingComponent ],
      providers: [
        RPCService,
        ElectronService,
        PeerService,
        StatusService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SyncingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
