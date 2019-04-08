import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../market.module';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { CoreModule } from 'app/core/core.module';
import { TemplateService } from './template.service';

describe('TemplateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        MarketModule.forRoot()
      ],
      providers: [TemplateService]
    });
  });

  it('should be created', inject([TemplateService], (service: TemplateService) => {
    expect(service).toBeTruthy();
  }));
});
