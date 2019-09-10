import { NgModule } from '@angular/core';

import { PartoshiAmountPipe } from './common.pipes';


@NgModule({
  imports: [],
  declarations: [
    PartoshiAmountPipe
  ],
  exports: [
    PartoshiAmountPipe
  ],
})
export class PipeModule { }
