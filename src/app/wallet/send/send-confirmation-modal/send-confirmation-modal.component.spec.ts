import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendConfirmationModalComponent } from './send-confirmation-modal.component';

describe('SendConfirmationModalComponent', () => {
  let component: SendConfirmationModalComponent;
  let fixture: ComponentFixture<SendConfirmationModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SendConfirmationModalComponent ]
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
