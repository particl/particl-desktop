import { TestBed, inject } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material';

import { MarketModule } from '../../market.module';
import { CoreUiModule } from '../../../../core-ui/core-ui.module';

import { FavoritesService } from './favorites.service';
import { SnackbarService } from '../../../snackbar/snackbar.service';


describe('FavoritesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreUiModule,
        MarketModule.forRoot()
      ],
      providers: [FavoritesService, SnackbarService, MatSnackBar]
    });
  });

  it('should be created', inject([FavoritesService], (service: FavoritesService) => {
    expect(service).toBeTruthy();
  }));
});
