import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EncryptWalletComponent } from './encrypt-wallet.component';

describe('EncryptWalletComponent', () => {
  let component: EncryptWalletComponent;
  let fixture: ComponentFixture<EncryptWalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EncryptWalletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EncryptWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
