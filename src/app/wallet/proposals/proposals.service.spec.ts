import { TestBed, inject, async } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { ProposalsService } from './proposals.service';
import { MarketService } from 'app/core/market/market.service';
import { MockMarketService } from 'app/core/market/market.mockservice';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { AddressService } from 'app/core/market/api/profile/address/address.service';
import { Sleep } from 'app/core/util/utils';
import { Responses } from 'app/core/market/mock-data/mock-market.responses';
import { MockProposalsService } from 'app/wallet/proposals/proposals.mockservice';

describe('ProposalsService', async () => {
  let sleep, proposalHash;
  beforeEach(() => {
    sleep = new Sleep().sleep;
    proposalHash = '8237fe3f87a27f68077eba1e069f5635137a8cb0c56e95cdd0d33cdfdadf719e';
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule
      ],
      providers: [
        {
          provide: MarketService, useClass: MockMarketService
        },
        {
          provide: ProposalsService, useClass: MockProposalsService
        },
        MarketStateService,
        AddressService,
        ProfileService,
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
    expect(proposals).not.toBe(undefined);
    expect(proposals.length).toEqual(5);
  }));

  it('should result method return the proposals result', inject([ProposalsService], async (service: ProposalsService) => {
    const proposalResult = await service.result(proposalHash).toPromise();
    expect(proposalResult).not.toBe(undefined);
    expect(proposalResult).toEqual(Responses.vote.result[proposalHash])
  }));

  it('should vote method return the proposals votes', inject([ProposalsService], async (service: ProposalsService) => {
    const params = [1, proposalHash];
    const proposalVotes = await service.get(proposalHash).toPromise();
    expect(proposalVotes).not.toBe(undefined);
    expect(proposalVotes).toEqual(Responses.vote.get[proposalHash])
  }));

  it('should vote method return not voted for other hash', inject([ProposalsService], async (service: ProposalsService) => {
    const invalidHash = `invailid-hash-8237fe3f87a27f68077eba1e069f5635137a8cb0c56e95cdd0d33cdfdadf719e`;
    const proposalResult = await service.get(invalidHash).toPromise();
    expect(proposalResult).not.toBe(undefined);

    const expectedResponse = Responses.vote.get[404];
    expect(proposalResult['success']).toEqual(expectedResponse.success)
    expect(proposalResult['message']).toEqual(expectedResponse.message)
    expect(proposalResult['error']).toEqual(expectedResponse.error)
  }));

});
