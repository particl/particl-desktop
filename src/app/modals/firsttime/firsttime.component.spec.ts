import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirsttimeComponent } from './firsttime.component';

describe('FirsttimeComponent', () => {
  let component: FirsttimeComponent;
  let fixture: ComponentFixture<FirsttimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirsttimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirsttimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
