import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketService } from './market.service';
import { MarketStateService } from './market-state/market-state.service';

import { CategoryService } from './api/category/category.service';
import { ProfileService } from './api/profile/profile.service';
import { TemplateService } from './api/template/template.service';

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
        MarketStateService,
        // API
        CategoryService,
        ProfileService,
        TemplateService
      ]
    };
  }
}
