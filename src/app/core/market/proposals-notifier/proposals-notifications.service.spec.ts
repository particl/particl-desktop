import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { MarketService } from 'app/core/market/market.service';
import { CoreModule } from 'app/core/core.module';

import { ProposalsNotificationsService } from './proposals-notifications.service';
import { ProposalsService } from 'app/wallet/proposals/proposals.service';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';

describe('ProposalsNotificationsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        CoreModule.forRoot(),
        RpcWithStateModule.forRoot()
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
