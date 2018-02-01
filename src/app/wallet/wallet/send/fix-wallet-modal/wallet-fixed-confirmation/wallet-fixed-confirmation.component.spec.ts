import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletFixedConfirmationComponent } from './wallet-fixed-confirmation.component';

describe('WalletFixedConfirmationComponent', () => {
  let component: WalletFixedConfirmationComponent;
  let fixture: ComponentFixture<WalletFixedConfirmationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletFixedConfirmationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletFixedConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
