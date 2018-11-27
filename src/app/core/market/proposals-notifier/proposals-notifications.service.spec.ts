import { TestBed, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { MarketService } from 'app/core/market/market.service';
import { CoreModule } from 'app/core/core.module';

import { ProposalsNotificationsService } from './proposals-notifications.service';
import { ProposalsService } from 'app/wallet/proposals/proposals.service';

describe('ProposalsNotificationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        RouterTestingModule,
        CoreModule.forRoot()
      ],
      providers: [
        ProposalsNotificationsService,
        ProposalsService,
        MarketService
      ]
    });
  });

  it('should be created', inject([ProposalsNotificationsService], (service: ProposalsNotificationsService) => {
    expect(service).toBeTruthy();
  }));
});
