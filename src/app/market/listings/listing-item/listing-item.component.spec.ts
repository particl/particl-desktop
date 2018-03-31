import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { ListingItemComponent } from './listing-item.component';

describe('ListingItemComponent', () => {
  let component: ListingItemComponent;
  let fixture: ComponentFixture<ListingItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListingItemComponent ],
      imports: [
        CoreUiModule.forRoot()
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
