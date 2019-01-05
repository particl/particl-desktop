import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EscrowType } from 'app/core/market/api/template/escrow/escrow.service';
import { of } from 'rxjs/observable/of';
import { addData } from 'app/_test/core-test/market-test/mock-data/template-mock-data/escrow-mock-data';
import { updateData } from 'app/_test/core-test/market-test/mock-data/template-mock-data/escrow-mock-data/update';


// @TODO change the of(<data>) with the respective market call once market-mock service merge in the market.

@Injectable()
export class RpcMockService {

  constructor() { }

  add(templateId: number, escrowType: EscrowType): Observable<any> {
    return of(addData);
  }

  update(templateId: number, escrowType: EscrowType) {
    return of(updateData)
  }
}
