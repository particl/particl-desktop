import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectBidModalComponent } from './reject-bid-modal.component';

describe('RejectBidModalComponent', () => {
  let component: RejectBidModalComponent;
  let fixture: ComponentFixture<RejectBidModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectBidModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectBidModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
