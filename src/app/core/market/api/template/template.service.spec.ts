import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../market.module';

import { TemplateService } from './template.service';

describe('TemplateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [TemplateService]
    });
  });

  it('should be created', inject([TemplateService], (service: TemplateService) => {
    expect(service).toBeTruthy();
  }));
});
