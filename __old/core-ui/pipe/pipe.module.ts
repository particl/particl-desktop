import { NgModule } from '@angular/core';

import { PartoshiAmountPipe, ParticlAmountPipe } from './common.pipes';


@NgModule({
  imports: [],
  declarations: [
    PartoshiAmountPipe,
    ParticlAmountPipe
  ],
  exports: [
    PartoshiAmountPipe,
    ParticlAmountPipe
  ],
})
export class PipeModule { }
