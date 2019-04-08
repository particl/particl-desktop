import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { CoreModule } from 'app/core/core.module';
import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { OrderCountComponent } from './order-count.component';

describe('OrderCountComponent', () => {
  let component: OrderCountComponent;
  let fixture: ComponentFixture<OrderCountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot()
      ],
      declarations: [OrderCountComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
