import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatFormFieldModule } from '@angular/material';

import { MaterialModule } from '../../../../core-ui/material/material.module';

import { SendService } from '../send.service';

import { SendConfirmationModalComponent } from './send-confirmation-modal.component';

describe('SendConfirmationModalComponent', () => {
  let component: SendConfirmationModalComponent;
  let fixture: ComponentFixture<SendConfirmationModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        MaterialModule,
        MatFormFieldModule // check if this is required. If so, move into CoreUi.
      ],
      declarations: [ SendConfirmationModalComponent ],
      providers: [
        { provide: MatDialogRef},
        SendService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendConfirmationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
