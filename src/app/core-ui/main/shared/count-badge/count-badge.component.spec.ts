import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CountBadgeComponent } from './count-badge.component';

describe('CountBadgeComponent', () => {
  let component: CountBadgeComponent;
  let fixture: ComponentFixture<CountBadgeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CountBadgeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CountBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
