import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { of } from 'rxjs/observable/of';
import { updateData } from './mock-data'

@Injectable()
export class PaymentMockService {

  constructor() { }

  public update(
    templateId: number,
    basePrice: number,
    domesticPrice: number,
    internationalPrice: number,
    paymentAddress?: string // TODO: class
  ) {

    return of(updateData);
  }

}
