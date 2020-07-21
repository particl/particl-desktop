import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoinControlModalComponent } from './coin-control-modal.component';

describe('CoinControlModalComponent', () => {
  let component: CoinControlModalComponent;
  let fixture: ComponentFixture<CoinControlModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CoinControlModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CoinControlModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
