import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketService } from './market.service';
import { MarketStateService } from './market-state/market-state.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class MarketModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MarketModule,
      providers: [
        MarketService,
        MarketStateService
      ]
    };
  }
}
