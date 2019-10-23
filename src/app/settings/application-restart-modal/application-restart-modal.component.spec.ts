import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MatIconModule } from '@angular/material';

import { ApplicationRestartModalComponent } from './application-restart-modal.component';
import { IpcService } from 'app/core/ipc/ipc.service';

describe('DeleteConfirmationModalComponent', () => {
  let component: ApplicationRestartModalComponent;
  let fixture: ComponentFixture<ApplicationRestartModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, MatDialogModule, MatIconModule ],
      declarations: [ ApplicationRestartModalComponent ],
      providers: [ { provide: MatDialogRef }, {provide: IpcService} ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationRestartModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
