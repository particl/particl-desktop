import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MdDialogModule, MdDialogRef, MdFormFieldModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { SendConfirmationModalComponent } from './send-confirmation-modal.component';

describe('SendConfirmationModalComponent', () => {
  let component: SendConfirmationModalComponent;
  let fixture: ComponentFixture<SendConfirmationModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MdDialogModule,
        BrowserModule,
        ReactiveFormsModule,
        FormsModule,
        MdFormFieldModule
      ],
      declarations: [ SendConfirmationModalComponent ],
      providers: [
        { provide: MdDialogRef}
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
