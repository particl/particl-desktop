import { TestBed, inject } from '@angular/core/testing';
import { SharedModule } from 'app/wallet/shared/shared.module';

import { MarketModule } from '../../market.module';
import { CoreModule } from 'app/core/core.module';
import { CategoryService } from './category.service';
import { MarketService } from '../../market.service';

describe('CategoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        MarketModule.forRoot()
      ],
      providers: [CategoryService, MarketService]
    });
  });

  it('should be created', inject([MarketService], (service: CategoryService) => {
    expect(service).toBeTruthy();
  }));
});
