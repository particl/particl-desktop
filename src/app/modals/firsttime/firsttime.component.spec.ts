import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';

import { ElectronService } from 'ngx-electron';
import { PeerService } from '../../core/rpc/peer.service';
import { RPCService } from '../../core/rpc/rpc.service';
import { StatusService } from '../../core/status/status.service';
import { ModalsService } from '../modals.service';

import { FirsttimeComponent } from './firsttime.component';

describe('FirsttimeComponent', () => {
  let component: FirsttimeComponent;
  let fixture: ComponentFixture<FirsttimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule
      ],
      declarations: [
        FirsttimeComponent
      ],
      providers: [
        ElectronService,
        PeerService,
        RPCService,
        StatusService,
        ModalsService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirsttimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
