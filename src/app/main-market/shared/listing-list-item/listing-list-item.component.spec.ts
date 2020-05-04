import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingListItemComponent } from './listing-list-item.component';

describe('ListingListItemComponent', () => {
  let component: ListingListItemComponent;
  let fixture: ComponentFixture<ListingListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListingListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
