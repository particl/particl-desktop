import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColdstakeComponent } from './coldstake.component';

describe('ColdstakeComponent', () => {
  let component: ColdstakeComponent;
  let fixture: ComponentFixture<ColdstakeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColdstakeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColdstakeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
