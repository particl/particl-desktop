import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeoffsetComponent } from './timeoffset.component';

describe('TimeoffsetComponent', () => {
  let component: TimeoffsetComponent;
  let fixture: ComponentFixture<TimeoffsetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeoffsetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeoffsetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
