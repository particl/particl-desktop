import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MatFormFieldModule } from '@angular/material';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../wallet/shared/shared.module';
import { CoreUiModule } from '../../core-ui/core-ui.module';
import { ProposalsService } from 'app/wallet/proposals/proposals.service';

import { ProposalsComponent } from './proposals.component';
import { ProposalDetailsComponent } from 'app/wallet/proposals/proposal-details/proposal-details.component';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';

describe('ProposalsComponent', () => {
  let component: ProposalsComponent;
  let fixture: ComponentFixture<ProposalsComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProposalsComponent, ProposalDetailsComponent],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        RpcWithStateModule.forRoot()
      ],
      providers: [
        ProposalsService,
        /* deps */
        { provide: MatDialogRef }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

