import { TestBed, inject } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material';

import { MarketModule } from '../../market.module';
import { CoreUiModule } from '../../../../core-ui/core-ui.module';
import { CoreModule } from 'app/core/core.module';
import { ReportService } from './report.service';


describe('ReportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forRoot(),
        CoreUiModule,
        MarketModule.forRoot()
      ],
      providers: [ ReportService ]
    });
  });

  it('should be created', inject([ReportService], (service: ReportService) => {
    expect(service).toBeTruthy();
  }));
});
