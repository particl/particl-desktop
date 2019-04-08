import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { MarketModule } from '../../market.module';
import { CoreModule } from 'app/core/core.module';
import { CategoryService } from './category.service';
import { MarketService } from '../../market.service';

fdescribe('CategoryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
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
