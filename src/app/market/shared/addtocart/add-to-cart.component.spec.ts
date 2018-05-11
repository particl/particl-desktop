import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddToCartComponent } from './add-to-cart.component';
import { CommonModule } from '@angular/common';

describe('AddToCartComponent', () => {
  let component: AddToCartComponent;
  let fixture: ComponentFixture<AddToCartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule
      ],
      declarations: [ AddToCartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddToCartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
