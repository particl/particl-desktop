import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../../market.module';
import { EscrowService } from './escrow.service';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';
import { IpcService } from 'app/core/ipc/ipc.service';

describe('EscrowService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        RpcWithStateModule.forRoot(),
        MarketModule.forRoot()
      ],
      providers: [
        IpcService,
        EscrowService
      ]
    });
  });

  it('should be created', inject([EscrowService], (service: EscrowService) => {
    expect(service).toBeTruthy();
  }));
});
