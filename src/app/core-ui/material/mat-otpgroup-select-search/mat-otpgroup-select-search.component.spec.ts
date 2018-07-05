import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatOtpGroupSelectSearchComponent } from './mat-otpgroup-select-search.component';

describe('MatOtpGroupSelectSearchComponent', () => {
  let component: MatOtpGroupSelectSearchComponent;
  let fixture: ComponentFixture<MatOtpGroupSelectSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatOtpGroupSelectSearchComponent ]
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
