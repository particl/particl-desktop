import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Location, LocationStrategy } from '@angular/common';

import { FirstTimeModalComponent } from './first-time.modal.component';

describe('FirstTimeModalComponent', () => {
  let component: FirstTimeModalComponent;
  let fixture: ComponentFixture<FirstTimeModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      declarations: [ FirstTimeModalComponent ],
      providers: [ Location ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstTimeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
