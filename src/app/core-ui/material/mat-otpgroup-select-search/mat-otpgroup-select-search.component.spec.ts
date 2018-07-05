import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatOtpGroupSelectSearchComponent } from './mat-otpgroup-select-search.component';
import { MaterialModule } from 'app/core-ui/material/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('MatOtpGroupSelectSearchComponent', () => {
  let component: MatOtpGroupSelectSearchComponent;
  let fixture: ComponentFixture<MatOtpGroupSelectSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MaterialModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatOtpGroupSelectSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
