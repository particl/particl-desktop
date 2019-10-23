import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MatIconModule } from '@angular/material';

import { DeleteWalletModalComponent } from './delete-wallet-modal.component';

describe('DeleteConfirmationModalComponent', () => {
  let component: DeleteWalletModalComponent;
  let fixture: ComponentFixture<DeleteWalletModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, MatDialogModule, MatIconModule ],
      declarations: [ DeleteWalletModalComponent ],
      providers: [ { provide: MatDialogRef } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteWalletModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
