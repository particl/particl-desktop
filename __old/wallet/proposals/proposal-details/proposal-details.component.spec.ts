import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProposalDetailsComponent } from './proposal-details.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { CoreModule } from 'app/core/core.module';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { ModalsModule } from 'app/modals/modals.module';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';

import { ProposalsService } from 'app/wallet/proposals/proposals.service';
import { ModalsHelperService } from 'app/modals/modals-helper.service';

describe('ProposalDetailsComponent', () => {
  let component: ProposalDetailsComponent;
  let fixture: ComponentFixture<ProposalDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        ModalsModule.forRoot(),
        RpcWithStateModule.forRoot()
      ],
      providers: [ ProposalsService, ModalsHelperService ],
      declarations: [ ProposalDetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
