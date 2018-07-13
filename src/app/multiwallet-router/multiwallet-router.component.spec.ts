import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiwalletRouterComponent } from './multiwallet-router.component';

describe('MultiwalletRouterComponent', () => {
  let component: MultiwalletRouterComponent;
  let fixture: ComponentFixture<MultiwalletRouterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiwalletRouterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiwalletRouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
