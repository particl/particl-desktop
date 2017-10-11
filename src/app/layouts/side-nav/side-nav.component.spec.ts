import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutSideNavComponent } from './side-nav.component';
import { MdDialog, MdDialogModule, MdExpansionModule, MdIconModule } from '@angular/material';
import { ModalsService} from '../../modals/modals.service';
import { BlockStatusService } from '../../core/rpc/blockstatus.service';
import { PeerService } from '../../core/rpc/peer.service';
import { RpcModule } from '../../core/rpc/rpc.module';
import { SharedModule } from '../../shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('LayoutSideNavComponent', () => {
  let component: LayoutSideNavComponent;
  let fixture: ComponentFixture<LayoutSideNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        MdExpansionModule,
        MdIconModule,
        MdDialogModule,
        RpcModule.forRoot(),
        BrowserAnimationsModule
      ],
      providers: [ MdDialog, ModalsService, BlockStatusService, PeerService ],
      declarations: [ LayoutSideNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutSideNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
