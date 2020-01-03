import { TestBed, inject } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material';

import { MarketModule } from '../../market.module';
import { CoreUiModule } from '../../../../core-ui/core-ui.module';

import { FavoritesService } from './favorites.service';
import { SnackbarService } from '../../../snackbar/snackbar.service';
import { CoreModule } from 'app/core/core.module';


describe('FavoritesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreUiModule,
        CoreModule.forRoot(),
        MarketModule.forRoot()
      ],
      providers: [FavoritesService, SnackbarService, MatSnackBar]
    });
  });

  it('should be created', inject([FavoritesService], (service: FavoritesService) => {
    expect(service).toBeTruthy();
  }));
});
