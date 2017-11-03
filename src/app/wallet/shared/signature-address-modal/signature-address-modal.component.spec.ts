import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignatureAddressModalComponent } from './signature-address-modal.component';

describe('SignatureAddressModalComponent', () => {
  let component: SignatureAddressModalComponent;
  let fixture: ComponentFixture<SignatureAddressModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignatureAddressModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignatureAddressModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
