import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../market.module';

import { CategoryService } from './category.service';
import { MarketService } from '../../market.service';

describe('CategoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [CategoryService, MarketService]
    });
  });

  it('should be created', inject([MarketService], (service: CategoryService) => {
    expect(service).toBeTruthy();
  }));
});
