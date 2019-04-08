import { TestBed, inject } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MarketModule } from '../../market.module';
import { CoreModule } from 'app/core/core.module';
import { TemplateService } from './template.service';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';

describe('TemplateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot(),
        SharedModule,
        RpcWithStateModule.forRoot(),
        BrowserAnimationsModule,
        CoreModule.forRoot()
      ],
      providers: [TemplateService]
    });
  });

  it('should be created', inject([TemplateService], (service: TemplateService) => {
    expect(service).toBeTruthy();
  }));
});
