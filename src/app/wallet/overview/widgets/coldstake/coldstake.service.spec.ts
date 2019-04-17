import { TestBed, inject } from '@angular/core/testing';

import { CoreModule } from '../../../../core/core.module';

import { ColdstakeService } from './coldstake.service';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';

describe('ColdstakeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        CoreModule.forRoot(),
        SharedModule,
        RpcWithStateModule.forRoot()
      ],
      providers: [ColdstakeService]
    });
  });

  it('should be created', inject([ColdstakeService], (service: ColdstakeService) => {
    expect(service).toBeTruthy();
  }));
});
