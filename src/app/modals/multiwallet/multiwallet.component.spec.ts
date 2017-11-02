import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiwalletComponent } from './multiwallet.component';

describe('MultiwalletComponent', () => {
  let component: MultiwalletComponent;
  let fixture: ComponentFixture<MultiwalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiwalletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiwalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
