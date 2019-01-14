import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessingModalComponent } from './processing-modal.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { CoreModule } from 'app/core/core.module';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

describe('ProcessingModalComponent', () => {
  let component: ProcessingModalComponent;
  let fixture: ComponentFixture<ProcessingModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessingModalComponent ],
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
      ],
      providers: [
        { provide: MatDialogRef },
        { provide: MAT_DIALOG_DATA }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
