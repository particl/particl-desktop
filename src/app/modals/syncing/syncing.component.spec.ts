import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncingComponent } from './syncing.component';

import { AppService } from '../../app.service';
import { RPCService } from '../../core/rpc/rpc.service';
import { PeerService } from '../../wallet/shared/peer.service';


describe('SyncingComponent', () => {
  let component: SyncingComponent;
  let fixture: ComponentFixture<SyncingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SyncingComponent ],
      providers: [
        AppService,
        RPCService,
        PeerService
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
