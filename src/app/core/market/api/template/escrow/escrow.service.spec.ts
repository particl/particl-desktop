import { TestBed, inject } from '@angular/core/testing';

import { MarketModule } from '../../../market.module';
import { EscrowService, EscrowType } from './escrow.service';
import { addData, updateData } from 'app/_test/core-test/market-test/template-test/escrow-test/mock-data';
import { EscrowMockService } from 'app/_test/core-test/market-test/template-test/escrow-test/escrow-mock.service';

describe('EscrowService', () => {

  const templateId = 1;
  const escrowType: EscrowType = EscrowType.MAD;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MarketModule.forRoot()
      ],
      providers: [
        { provide: EscrowService, useClass: EscrowMockService }
      ]
    });
  });

  it('should be created', inject([EscrowService], (service: EscrowService) => {
    expect(service).toBeTruthy();
  }));

  it('should add method return the success with reponse data', inject([EscrowService], async (service: EscrowService) => {
    expect(service).toBeTruthy();
    const escrow = await service.add(templateId, escrowType).toPromise()
    expect(escrow).not.toBe(null);
    expect(escrow).toEqual(addData);
  }));

  it('should update method return the success with reponse data', inject([EscrowService], async (service: EscrowService) => {
    const escrow = await service.update(templateId, escrowType).toPromise()
    expect(escrow).not.toBe(null);
    expect(escrow).toEqual(updateData);
  }));

});
