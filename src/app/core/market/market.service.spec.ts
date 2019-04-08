import { TestBed, inject } from '@angular/core/testing';

import { MarketService } from './market.service';
import { MarketModule } from './market.module';
import { HttpClientModule } from '@angular/common/http';
import { CoreModule } from 'app/core/core.module';

fdescribe('MarketService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        CoreModule.forRoot(),
        MarketModule.forRoot()
      ],
      providers: [ MarketService ]
    });
  });

  it('should be created', inject([MarketService], (service: MarketService) => {
    expect(service).toBeTruthy();
  }));
});
