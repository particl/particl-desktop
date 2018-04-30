import { TestBed, inject } from '@angular/core/testing';

import { FavoriteCacheService } from './favorite-cache.service';

describe('FavoriteCacheService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FavoriteCacheService]
    });
  });

  it('should be created', inject([FavoriteCacheService], (service: FavoriteCacheService) => {
    expect(service).toBeTruthy();
  }));
});
