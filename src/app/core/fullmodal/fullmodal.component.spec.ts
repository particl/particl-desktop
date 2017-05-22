import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FullmodalComponent } from './fullmodal.component';

describe('FullmodalComponent', () => {
  let component: FullmodalComponent;
  let fixture: ComponentFixture<FullmodalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FullmodalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FullmodalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
