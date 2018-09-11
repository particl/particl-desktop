import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MatFormFieldModule } from '@angular/material';
import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../wallet/shared/shared.module';
import { CoreUiModule } from '../../core-ui/core-ui.module';
import { ProposalVoteConfirmationComponent } from './proposal-vote-confirmation.component';

describe('ProposalVoteConfirmationComponent', () => {
  let component: ProposalVoteConfirmationComponent;
  let fixture: ComponentFixture<ProposalVoteConfirmationComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProposalVoteConfirmationComponent ],
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot()
      ],
      providers: [
        /* deps */
        { provide: MatDialogRef }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalVoteConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
