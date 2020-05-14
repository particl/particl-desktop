import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelBidModalComponent } from './cancel-bid-modal.component';

describe('CancelBidModalComponent', () => {
  let component: CancelBidModalComponent;
  let fixture: ComponentFixture<CancelBidModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelBidModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelBidModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
