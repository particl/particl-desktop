import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EscrowType } from 'app/core/market/api/template/escrow/escrow.service';
import { of } from 'rxjs/observable/of';
import { escrowAdd, escrowUpdate } from 'app/_test/core-test/market-test/template-test/escrow-test/mock-data';

// @TODO change the of(<data>) with the respective market call once market-mock service merge in the market.

@Injectable()
export class EscrowMockService {

  constructor() { }

  add(templateId: number, escrowType: EscrowType): Observable<any> {
    return of(escrowAdd);
  }

  update(templateId: number, escrowType: EscrowType) {
    return of(escrowUpdate)
  }
}
