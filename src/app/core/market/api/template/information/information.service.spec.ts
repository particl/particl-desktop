import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../../market.module';

import { InformationService } from './information.service';

describe('InformationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [InformationService]
    });
  });

  it('should be created', inject([InformationService], (service: InformationService) => {
    expect(service).toBeTruthy();
  }));
});
