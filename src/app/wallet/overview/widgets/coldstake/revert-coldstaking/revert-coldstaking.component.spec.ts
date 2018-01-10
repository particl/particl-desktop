import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevertColdstakingComponent } from './revert-coldstaking.component';

describe('RevertColdstakingComponent', () => {
  let component: RevertColdstakingComponent;
  let fixture: ComponentFixture<RevertColdstakingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RevertColdstakingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevertColdstakingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
