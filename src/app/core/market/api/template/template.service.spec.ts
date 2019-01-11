import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../market.module';

import { TemplateService } from './template.service';
import { TemplateMockService } from 'app/_test/core-test/market-test/template-test/template-mock.service';
import { getData, postData, searchData, addData } from 'app/_test/core-test/market-test/mock-data/template-mock-data';
import { Template } from 'app/core/market/api/template/template.model';

describe('TemplateService', () => {
  const templateId = 1;
  let template;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [{
        provide: TemplateService, useClass: TemplateMockService
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
    expect(response).toEqual(new Template(getData));
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
    expect(template).toEqual(addData);

  }));

  it('should post method return the success and reponse data', inject([TemplateService], async (service: TemplateService) => {
    expect(service).toBeTruthy();
    const response = await service.post(
      template,
      1,
      4  // listing expiry time.
    ).toPromise();

    expect(response).not.toBe(null);
    expect(response).toEqual(postData);

  }));

  it('should remove method return the success', inject([TemplateService], async (service: TemplateService) => {
    expect(service).toBeTruthy();
    const response = await service.remove(templateId).toPromise();

    expect(response).not.toBe(null);
  }));
});
