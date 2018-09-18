import { TestBed, inject } from '@angular/core/testing';

import { ProposalsService } from './proposals.service';
import { RpcService } from 'app/core/rpc/rpc.service';
import { CoreModule } from 'app/core/core.module';

describe('ProposalsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forRoot()
      ],
      providers: [ProposalsService]
    });
  });

  it('should be created', inject([ProposalsService], (service: ProposalsService) => {
    expect(service).toBeTruthy();
  }));
});
