import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketModule } from '../../../core/market/market.module';
import { MaterialModule } from '../../../core-ui/material/material.module';
import { FavoritesService } from '../../../core/market/api/favorites/favorites.service';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';

import { FavoriteComponent } from './favorite.component';

describe('FavoriteComponent', () => {
  let component: FavoriteComponent;
  let fixture: ComponentFixture<FavoriteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,
        MarketModule.forRoot()
      ],
      declarations: [ FavoriteComponent ],
      providers: [
        FavoritesService,
        SnackbarService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavoriteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
