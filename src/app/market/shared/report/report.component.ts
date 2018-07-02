import { Component, Input } from '@angular/core';
import { Log } from 'ng2-logger';

import { ReportService } from '../../../core/market/api/report/report.service';
import { SnackbarService } from '../../../core/snackbar/snackbar.service';
import { MarketStateService } from '../../../core/market/market-state/market-state.service';

import { Listing } from '../../../core/market/api/listing/listing.model';
import { ReportCacheService } from 'app/core/market/market-cache/report-cache.service';


@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent {

  private log: any = Log.create('report.component id:' + Math.floor((Math.random() * 1000) + 1));

  @Input() listing: Listing;
  @Input() flag: boolean = true;
  constructor(
    public report: ReportService,
    private snackbar: SnackbarService,
    private marketState: MarketStateService
  ) {}

  toggle() {
    this.report.toggle(this.listing);
  }

  get isReported(): boolean {
    return this.listing && this.report.cache.isReported(this.listing);
  }
}
