import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MatFormFieldModule } from '@angular/material';
import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../wallet/shared/shared.module';
import { CoreUiModule } from '../../core-ui/core-ui.module';
import { ProposalsService } from 'app/wallet/proposals/proposals.service';

import { ProposalConfirmationComponent } from './proposal-confirmation.component';

describe('ProposalConfirmationComponent', () => {
  let component: ProposalConfirmationComponent;
  let fixture: ComponentFixture<ProposalConfirmationComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProposalConfirmationComponent ],
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
      ],
      providers: [
        /* deps */
        ProposalsService,
        { provide: MatDialogRef }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
