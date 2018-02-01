import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewListingComponent } from './preview-listing.component';

describe('PreviewListingComponent', () => {
  let component: PreviewListingComponent;
  let fixture: ComponentFixture<PreviewListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewListingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
