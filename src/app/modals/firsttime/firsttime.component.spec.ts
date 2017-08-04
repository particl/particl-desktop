import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FirsttimeComponent } from './firsttime.component';
import { ModalsService } from '../modals.service';

describe('FirsttimeComponent', () => {
  let component: FirsttimeComponent;
  let fixture: ComponentFixture<FirsttimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FirsttimeComponent ],
      providers: [ ModalsService ]
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
/*
  it('should use create ', () => {
    component.create();
    expect(component.create).toBeTruthy();
  });

  it('should restore', () => {
    component.restore();
    expect(component.restore).toBeTruthy();
  });
  */
});
