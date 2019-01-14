import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../../market.module';

import { InformationService } from './information.service';
import { informationUpdate } from 'app/_test/core-test/market-test/template-test/information-test/mock-data';
import { MarketService } from 'app/core/market/market.service';
import { MockMarketService } from 'app/_test/core-test/market-test/market.mockservice';


describe('InformationService', () => {
  const templateId = 1;
  const categoryId = 1;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [
        { provide: MarketService, useClass: MockMarketService }
      ]
    });
  });

  it('should be created', inject([InformationService], (service: InformationService) => {
    expect(service).toBeTruthy();
  }));

  it('should update method return success reponse', inject([InformationService], async (service: InformationService) => {
    expect(service).toBeTruthy();
    const response = await service.update(templateId, 'title', 'shortDesc', 'longDesc', categoryId).toPromise()

    expect(response).not.toBe(null)
    expect(response).toEqual(informationUpdate)
  }));

});
