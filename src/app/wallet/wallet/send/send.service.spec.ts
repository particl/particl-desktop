import { TestBed, inject } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CoreUiModule } from '../../../core-ui/core-ui.module';
import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../shared/shared.module'; // is this even needed?
import { RpcService } from 'app/core/rpc/rpc.service';
import { SendService } from './send.service';
import { RpcMockService } from 'app/_test/core-test/rpc-test/rpc-mock.service';
import { TransactionBuilder, TxType } from './transaction-builder.model';
import { mockSendInfo } from 'app/_test/core-test/rpc-test/mock-data/send.mock';

describe('SendService', () => {
  const txs = new TransactionBuilder();
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
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

  it('should send transaction', inject([SendService], (service: SendService) => {
    txs.toAddress = 'rDkxgW9YuuU86ogFW3anyhSkVddH56PmVt';
    txs.amount = 1;
    service.sendTransaction(txs)
    expect(txs.estimateFeeOnly).toBe(false);
  }));

  it('should transfer transaction', inject([SendService], (service: SendService) => {
    txs.amount = 1;
    service.transferBalance(txs)
    expect(txs.toAddress).toEqual('rDkxgW9YuuU86ogFW3anyhSkVddH56PmVt');
  }));

  it('should get fee', inject([SendService], (service: SendService) => {
    txs.toAddress = 'rDkxgW9YuuU86ogFW3anyhSkVddH56PmVt';
    service.getTransactionFee(txs).subscribe(fee => {
      expect(txs.estimateFeeOnly).toBe(true);
      expect(fee).toEqual(mockSendInfo);
    })
  }));
});
