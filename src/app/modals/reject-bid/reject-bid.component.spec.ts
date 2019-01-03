import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectBidComponent } from './reject-bid.component';

describe('RejectBidComponent', () => {
  let component: RejectBidComponent;
  let fixture: ComponentFixture<RejectBidComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectBidComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectBidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
