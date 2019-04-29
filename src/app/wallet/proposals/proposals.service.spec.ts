import { TestBed, inject, tick } from '@angular/core/testing';
import { CoreModule } from 'app/core/core.module';

import { ProposalsService } from './proposals.service';

import { MarketService } from 'app/core/market/market.service';
import { ProfileService } from 'app/core/market/api/profile/profile.service';
import { MarketStateService } from 'app/core/market/market-state/market-state.service';
import { AddressService } from 'app/core/market/api/profile/address/address.service';
import { MockMarketService } from 'app/_test/core-test/market-test/market.mockservice';
import { ProposalResult } from 'app/wallet/proposals/models/proposal-result.model';
import { VoteDetails } from 'app/wallet/proposals/models/vote-details.model';

import { Responses } from 'app/_test/core-test/market-test/mock-data/mock-market.responses';

describe('ProposalsService', async () => {
  let proposalHash;
  beforeEach(() => {

    proposalHash = '8237fe3f87a27f68077eba1e069f5635137a8cb0c56e95cdd0d33cdfdadf719e';

    TestBed.configureTestingModule({
      providers: [
        {
          provide: MarketService, useClass: MockMarketService
        },
        ProposalsService,
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
    service.start();
    const startTime = new Date();
    const endTime = '*';
    const proposals = await service.list(startTime, endTime).toPromise();
    expect(proposals).not.toBe(undefined);
    expect(proposals.length).toEqual(5);
  }));

  it('should result method return the proposals result', inject([ProposalsService], async (service: ProposalsService) => {
    const proposalResult = await service.result(proposalHash).toPromise();
    expect(proposalResult).not.toBe(undefined);
    expect(proposalResult).toEqual(new ProposalResult(Responses.proposal.result))
  }));

  it('should vote method return the proposals votes', inject([ProposalsService], async (service: ProposalsService) => {
    const params = [1, proposalHash];
    const proposalVotes = await service.get(proposalHash).toPromise();
    expect(proposalVotes).not.toBe(undefined);
    expect(proposalVotes).toEqual(new VoteDetails(Responses.vote.get))
  }));
});
