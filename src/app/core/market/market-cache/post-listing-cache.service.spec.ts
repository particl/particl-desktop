import { TestBed, inject } from '@angular/core/testing';

import { PostListingCacheService } from './post-listing-cache.service';

describe('PostListingCacheService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PostListingCacheService]
    });
  });

  it('should be created', inject([PostListingCacheService], (service: PostListingCacheService) => {
    expect(service).toBeTruthy();
  }));
});
