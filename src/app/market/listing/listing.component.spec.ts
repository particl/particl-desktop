import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MarketModule } from '../../core/market/market.module';

import { CartService } from '../../core/market/api/cart/cart.service';
import { SnackbarService } from '../../core/snackbar/snackbar.service';

import { ListingComponent } from './listing.component';

describe('ListingComponent', () => {
  let component: ListingComponent;
  let fixture: ComponentFixture<ListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListingComponent ],
      imports: [
        CoreUiModule.forRoot(),
        MarketModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef},
        { provide: MAT_DIALOG_DATA, useValue: {}, },
        CartService,
        SnackbarService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
