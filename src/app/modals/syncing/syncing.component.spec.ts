import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncingComponent } from './syncing.component';

import { ElectronService } from 'ngx-electron';
import { SharedModule } from '../../shared/shared.module';

import { RPCService } from '../../core/rpc/rpc.service';

import { PeerService } from '../../core/rpc/peer.service';

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

  it('should calculateSyncingDetails', () => {
    expect(component.calculateSyncingDetails).toBeTruthy();
  });

  it('should getRemainder', () => {
    expect(component.getRemainder).toBeTruthy();
  });

  it('should getEstimateTimeLeft', () => {
    expect(component.getEstimateTimeLeft).toBeTruthy();
  });

  it('should get estimatedTimeLeft', () => {
    expect(component.estimatedTimeLeft).toBe(0);
  });

  it('should get increasePerMinute', () => {
    expect(component.increasePerMinute).toBe(0);
  });
/*
  it('should get lastBlockTime', () => {
    expect(component.lastBlockTime).toBe(Date;
  });
*/
  it('should get remainingBlocks', () => {
    expect(component.remainingBlocks).toBeDefined();
  });
});
