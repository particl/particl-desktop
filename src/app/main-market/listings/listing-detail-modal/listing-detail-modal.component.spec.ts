import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingDetailModalComponent } from './listing-detail-modal.component';

describe('ListingDetailModalComponent', () => {
  let component: ListingDetailModalComponent;
  let fixture: ComponentFixture<ListingDetailModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListingDetailModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
