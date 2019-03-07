import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../market.module';

import { CategoryService } from './category.service';
import { MarketService } from '../../market.service';
import { CoreModule } from 'app/core/core.module';

describe('CategoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forTest(),
        MarketModule.forRoot()
      ],
      providers: [CategoryService, MarketService]
    });
  });

  it('should be created', inject([MarketService], (service: CategoryService) => {
    expect(service).toBeTruthy();
  }));
});
