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
        RpcModule.forROot()
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
});
