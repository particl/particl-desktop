import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncingComponent } from './syncing.component';

import { ElectronService } from 'ngx-electron';
import { SharedModule } from '../../shared/shared.module';
import { AppService } from '../../app.service';
import { RPCService } from '../../core/rpc/rpc.service';


describe('SyncingComponent', () => {
  let component: SyncingComponent;
  let fixture: ComponentFixture<SyncingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule ],
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
