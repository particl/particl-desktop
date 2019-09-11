import { Pipe, PipeTransform } from '@angular/core';
import { PartoshiAmount } from 'app/core/util/utils';

@Pipe({name: 'partoshiAmount'})
export class PartoshiAmountPipe implements PipeTransform {
  transform(value: number): string {
    const partoshiAmount = new PartoshiAmount(value * Math.pow(10, 8));
    return partoshiAmount.particlsString();
  }
}
