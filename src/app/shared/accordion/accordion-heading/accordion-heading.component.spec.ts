import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccordionHeadingComponent } from './accordion-heading.component';

describe('AccordionHeadingComponent', () => {
  let component: AccordionHeadingComponent;
  let fixture: ComponentFixture<AccordionHeadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccordionHeadingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccordionHeadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
