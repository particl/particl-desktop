import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule, MatStepperModule } from '@angular/material';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { MaterialModule } from '../../../core-ui/material/material.module';
import { CheckoutProcessComponent } from './checkout-process.component';

describe('CheckoutProcessComponent', () => {
  let component: CheckoutProcessComponent;
  let fixture: ComponentFixture<CheckoutProcessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      imports: [
        MaterialModule,
        MatStepperModule
      ],
      declarations: [ CheckoutProcessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CheckoutProcessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
