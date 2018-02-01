import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixWalletModalComponent } from './fix-wallet-modal.component';

describe('FixWalletModalComponent', () => {
  let component: FixWalletModalComponent;
  let fixture: ComponentFixture<FixWalletModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixWalletModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixWalletModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
