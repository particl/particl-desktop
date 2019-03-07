import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../market.module';

import { TemplateService } from './template.service';
import { CoreModule } from 'app/core/core.module';

describe('TemplateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forTest(),
        MarketModule.forRoot()
      ],
      providers: [TemplateService]
    });
  });

  it('should be created', inject([TemplateService], (service: TemplateService) => {
    expect(service).toBeTruthy();
  }));
});
