import { TestBed, inject, async } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { ProposalsService } from './proposals.service';
import { MarketService } from 'app/core/market/market.service';
import { MockMarketService } from 'app/core/market/market.mockservice';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { AddressService } from 'app/core/market/api/profile/address/address.service';
import { Sleep } from 'app/core/util/utils';

describe('ProposalsService', async () => {
  let sleep;
  beforeEach(() => {
    sleep = new Sleep().sleep;
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
        ProposalsService
      ]
    });
  });

  it('should be created', inject([ProposalsService], (service: ProposalsService) => {
    expect(service).toBeTruthy();
  }));

  it('should list method return the proposals list', inject([ProposalsService], async (service: ProposalsService) => {
    const startTime = new Date();
    const endTime = '*';
    const proposals = await service.list(startTime, endTime).toPromise();
    expect(proposals.length).toEqual(6);
  }));

});
