import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutSideNavComponent } from './side-nav.component';

describe('LayoutSideNavComponent', () => {
  let component: LayoutSideNavComponent;
  let fixture: ComponentFixture<LayoutSideNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayoutSideNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayoutSideNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
