import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncingComponent } from './syncing.component';

import { SharedModule } from '../../shared/shared.module';
import { RpcModule } from '../../core/rpc/rpc.module';

import { BlockStatusService } from '../../core/rpc/blockstatus.service';

describe('SyncingComponent', () => {
  let component: SyncingComponent;
  let fixture: ComponentFixture<SyncingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcModule.forRoot()
       ],
      declarations: [ SyncingComponent ]
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

  it('should calculateSyncingDetails and estimatedTimeLeft', () => {
    component.calculateSyncingDetails(new Date(), 10);
    console.log(component.estimatedTimeLeft);
    expect(component.estimatedTimeLeft).toBe(0);
  });
/*
  it('should getRemainder', () => {
    component.getRemainder();
    expect(component.getRemainder).tobe();
  });
*/
  it('should get increasePerMinute', () => {
    expect(component.increasePerMinute).toBe(0);
  });

  it('should get lastBlockTime', () => {
    expect(component.lastBlockTime).toBeDefined();
  });

  it('should get remainingBlocks', () => {
    expect(component.remainingBlocks).toBeDefined();
  });
});
