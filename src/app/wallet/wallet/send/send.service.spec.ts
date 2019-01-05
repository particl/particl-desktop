import { TestBed, inject } from '@angular/core/testing';

import { CoreUiModule } from '../../../core-ui/core-ui.module';
import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../shared/shared.module'; // is this even needed?
import { RpcService } from 'app/core/rpc/rpc.service';
import { SendService } from './send.service';
import { RpcMockService } from 'app/_test/core-test/rpc-test/rpc-mock.service';

describe('SendService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot()
      ],
      providers: [
      SendService,
      { provide: RpcService, useClass: RpcMockService }
      ]

    });
  });

  it('should be created', inject([SendService], (service: SendService) => {
    expect(service).toBeTruthy();
  }));
});
