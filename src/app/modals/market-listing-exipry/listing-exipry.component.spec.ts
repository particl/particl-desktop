import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingExipryComponent } from './listing-exipry.component';

describe('ListingExipryComponent', () => {
  let component: ListingExipryComponent;
  let fixture: ComponentFixture<ListingExipryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListingExipryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingExipryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
