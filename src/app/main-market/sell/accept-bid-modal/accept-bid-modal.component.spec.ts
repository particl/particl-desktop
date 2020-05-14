import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptBidModalComponent } from './accept-bid-modal.component';

describe('AcceptBidModalComponent', () => {
  let component: AcceptBidModalComponent;
  let fixture: ComponentFixture<AcceptBidModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcceptBidModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptBidModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
