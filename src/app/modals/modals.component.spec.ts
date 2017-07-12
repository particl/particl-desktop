import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalModule } from 'ngx-bootstrap';
import { HttpModule } from '@angular/http';

import { ElectronService } from 'ngx-electron';
import { PeerService } from '../core/rpc/peer.service';
import { RPCService } from '../core/rpc/rpc.service';
import { StatusService } from '../core/status/status.service';

import { ModalsModule } from './modals.module';

import { ModalsComponent } from './modals.component';

describe('ModalsComponent', () => {
  let component: ModalsComponent;
  let fixture: ComponentFixture<ModalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpModule,
        ModalsModule,
        ModalModule.forRoot()
      ],
      providers: [
        ElectronService,
        PeerService,
        RPCService,
        StatusService,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
