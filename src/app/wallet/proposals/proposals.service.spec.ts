import { TestBed, inject } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { ProposalsService } from './proposals.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { CoreModule } from 'app/core/core.module';
import { MarketService } from 'app/core/market/market.service';
import { MockMarketService } from 'app/core/market/market.mockservice';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { AddressService } from 'app/core/market/api/profile/address/address.service';

fdescribe('ProposalsService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [
        {
          provide: MarketService, useClass: MockMarketService
        },
        MarketStateService,
        AddressService,
        ProfileService,
        ProposalsService,
      ]
    });
  });

  it('should be created', inject([ProposalsService], (service: ProposalsService) => {
    expect(service).toBeTruthy();
  }));
});
