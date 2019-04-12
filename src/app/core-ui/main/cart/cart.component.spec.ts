import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing'

import { CoreModule } from '../../../core/core.module';
import { CoreUiModule } from '../../core-ui.module';

import { CartComponent } from './cart.component';
import { cartItemList } from 'app/_test/core-test/market-test/api-test/cart-test/mock-data/list';
import { Cart } from 'app/core/market/api/cart/cart.model';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  const cart = cartItemList;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot()
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should cart cart info section exist', () => {
    const compiled = fixture.debugElement.nativeElement;
    const cartInfo = compiled.querySelector('.cart-info');
    expect(cartInfo).toBeTruthy();
  });

  it('should cart icon exist in cart info section', () => {
    const compiled = fixture.debugElement.nativeElement;
    const icons = compiled.querySelector('.cart-info mat-icon.part-cart');
    expect(icons).toBeTruthy();
  });

  it('should amount section exist if cart count is greater than 0', () => {
    const compiled = fixture.debugElement.nativeElement;
    const itemCountSection = compiled.querySelector('.cart-info .tag');
    expect(itemCountSection).toBeTruthy();
    const itemCount = +itemCountSection.textContent;
    const amountSec = compiled.querySelector('.cart-info .amount');

    if (itemCount) {
      expect(amountSec).toBeTruthy();
    } else {
      expect(amountSec).toBeFalsy();
    }
  });

  it('should amount section exist if cart count is greater than 0', () => {
    component.cart = new Cart(cart);

    // detect the changes.
    fixture.detectChanges();

    const compiled = fixture.debugElement.nativeElement;
    const itemCountSection = compiled.querySelector('.cart-info .tag');
    expect(itemCountSection).toBeTruthy();
    const itemCount = +itemCountSection.textContent;
    const amountSec = compiled.querySelector('.cart-info .amount');

    expect(itemCount).not.toEqual(0);

    expect(amountSec).toBeTruthy();
  });

});
