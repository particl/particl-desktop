import { Pipe, PipeTransform } from '@angular/core';
import { PartoshiAmount } from 'app/core/util/utils';

@Pipe({name: 'partoshiAmount'})
export class PartoshiAmountPipe implements PipeTransform {
  transform(partoshi: number): string {
    const partoshiAmount = new PartoshiAmount(partoshi);
    return partoshiAmount.particlsString();
  }
}

@Pipe({name: 'particlAmount'})
export class ParticlAmountPipe implements PipeTransform {
  transform(particl: number): string {
    const partoshiAmount = new PartoshiAmount(particl * Math.pow(10, 8));
    return partoshiAmount.particlsString();
  }
}
