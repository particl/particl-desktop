import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MarketModule } from '../../../core/market/market.module';

import { CartService } from '../../../core/market/api/cart/cart.service';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';

import { PreviewListingComponent } from './preview-listing.component';

describe('PreviewListingComponent', () => {
  let component: PreviewListingComponent;
  let fixture: ComponentFixture<PreviewListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewListingComponent ],
      imports: [
        CoreUiModule.forRoot(),
        MarketModule.forRoot()
      ],
      providers: [ CartService, SnackbarService ]
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
