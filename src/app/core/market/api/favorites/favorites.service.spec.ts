import { TestBed, inject } from '@angular/core/testing';

import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FavoritesService]
    });
  });

  it('should be created', inject([FavoritesService], (service: FavoritesService) => {
    expect(service).toBeTruthy();
  }));
});
