import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreRouterComponent } from './core-router.component';

describe('CoreRouterComponent', () => {
  let component: CoreRouterComponent;
  let fixture: ComponentFixture<CoreRouterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoreRouterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoreRouterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
