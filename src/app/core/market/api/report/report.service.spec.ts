import { TestBed, inject } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material';

import { MarketModule } from '../../market.module';
import { CoreUiModule } from '../../../../core-ui/core-ui.module';

import { ReportService } from './report.service';
import { SnackbarService } from '../../../snackbar/snackbar.service';


describe('ReportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreUiModule,
        MarketModule.forRoot()
      ],
      providers: [ReportService, SnackbarService, MatSnackBar]
    });
  });

  it('should be created', inject([ReportService], (service: ReportService) => {
    expect(service).toBeTruthy();
  }));
});
