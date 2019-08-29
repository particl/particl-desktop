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

  it('should count tag invisible when count value is not exist', () => {
    expect(component).toBeTruthy();
    component.count = 0;
    const compiled = fixture.debugElement.nativeElement;
    const tag = compiled.querySelector('.tag');
    expect(tag).toBeFalsy();
  });

  it('should count tag exist when count value is exist', () => {
    expect(component).toBeTruthy();
    component.count = 2;
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    const tag = compiled.querySelector('.tag');
    expect(tag).toBeTruthy();
    expect(+tag.innerHTML.trim()).toEqual(2)
  });

});
