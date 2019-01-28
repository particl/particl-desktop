import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../market.module';

import { ReportService } from './report.service';
import { MarketService } from 'app/core/market/market.service';
import { MockMarketService } from 'app/_test/core-test/market-test/market.mockservice';
import { postReport } from 'app/_test/core-test/market-test/report-test/mock-data';


fdescribe('ReportService', () => {
  const listingHash = '9e2d5556e28dab6195f2a871e771091ffceb433b5507cb43406a05f6e749f244';
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

  it('should be created', inject([ReportService], (service: ReportService) => {
    expect(service).toBeTruthy();
  }));

  it('should post method resturn the success with success response', inject([ReportService], async (service: ReportService) => {
    expect(service).toBeTruthy();
    const response = await service.post(listingHash).toPromise();
    console.log('response-----', response);
    expect(response).not.toBe(undefined);
    expect(response).toEqual(postReport);
  }));


});
