import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MatIconModule } from '@angular/material';

import { DeleteConfirmationModalComponent } from './delete-confirmation-modal.component';

describe('DeleteConfirmationModalComponent', () => {
  let component: DeleteConfirmationModalComponent;
  let fixture: ComponentFixture<DeleteConfirmationModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, MatDialogModule, MatIconModule ],
      declarations: [ DeleteConfirmationModalComponent ],
      providers: [ { provide: MatDialogRef } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteConfirmationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
