import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../market.module';

import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [FavoritesService]
    });
  });

  it('should be created', inject([FavoritesService], (service: FavoritesService) => {
    expect(service).toBeTruthy();
  }));
});
