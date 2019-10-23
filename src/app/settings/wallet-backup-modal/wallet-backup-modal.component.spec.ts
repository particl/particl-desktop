import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MatIconModule } from '@angular/material';

import { WalletBackupModalComponent } from './wallet-backup-modal.component';

describe('DeleteConfirmationModalComponent', () => {
  let component: WalletBackupModalComponent;
  let fixture: ComponentFixture<WalletBackupModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, MatDialogModule, MatIconModule ],
      declarations: [ WalletBackupModalComponent ],
      providers: [ { provide: MatDialogRef } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletBackupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
