import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../../market.module';

import { InformationService } from './information.service';
import { InformationMockService } from 'app/_test/core-test/market-test/template-test/information-test/information-mock.service';
import { updateData } from 'app/_test/core-test/market-test/template-test/information-test/mock-data/update';


describe('InformationService', () => {
  const templateId = 1;
  const categoryId = 1;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [
        { provide: InformationService, useClass: InformationMockService }
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
    expect(response).toEqual(updateData)
  }));

});
