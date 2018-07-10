import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatFormFieldModule } from '@angular/material';
import { MaterialModule } from '../../core-ui/material/material.module';


describe('ProposalConfirmationComponent', () => {
  let component: ProposalConfirmationComponent;
  let fixture: ComponentFixture<ProposalConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MaterialModule,
        MatFormFieldModule // check if this is required. If so, move into CoreUi.
      ],
      declarations: [ ProposalConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProposalConfirmationComponent);
    component = fixture.componentInstance;
    component.send = new TransactionBuilder();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
