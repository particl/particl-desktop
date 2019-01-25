import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../market.module';

import { TemplateService } from './template.service';
// import { getData, postData, searchData, addData } from 'app/_test/core-test/market-test/template-mock-data/mock-data';
import { Template } from 'app/core/market/api/template/template.model';
import { MarketService } from 'app/core/market/market.service';
import { MockMarketService } from 'app/_test/core-test/market-test/market.mockservice';
import { templateAdd, templateGet, templatePost, templateSearch } from 'app/_test/core-test/market-test/template-test/mock-data';

describe('TemplateService', () => {
  const templateId = 1;
  let template;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [{
        provide: MarketService, useClass: MockMarketService
      }]
    });
  });


  it('should be created', inject([TemplateService], (service: TemplateService) => {
    expect(service).toBeTruthy();
  }));

  it(`should get method return the template of template Id; ${templateId}`, inject([TemplateService], async (service: TemplateService) => {

    expect(service).toBeTruthy();
    const response = await service.get(templateId).toPromise();
    expect(response).not.toBe(null);
    expect(response).toEqual(new Template(templateGet));
    expect(response.id).toBe(templateId)
  }));


  it('should add method return the success and reponse data', inject([TemplateService], async (service: TemplateService) => {
    expect(service).toBeTruthy();
    template = await service.add(
      'listing title',
      'listing shortDesscription',
      'listing longDescription',
      3,
      'SALE',
      'PARTICL',
      10,
      1,
      1,
      'paymentAddress'
    ).toPromise();

    expect(template).not.toBe(null);
    expect(template).toEqual(templateAdd);

  }));

  it('should post method return the success and reponse data', inject([TemplateService], async (service: TemplateService) => {
    expect(service).toBeTruthy();
    const response = await service.post(
      new Template(templateGet),
      1,
      4  // listing expiry time.
    ).toPromise();

    expect(response).not.toBe(null);
    expect(response).toEqual(templatePost);


  }));

  it('should remove method return the success', inject([TemplateService], async (service: TemplateService) => {
    expect(service).toBeTruthy();
    const response = await service.remove(templateId).toPromise();

    expect(response).not.toBe(null);
  }));
});
