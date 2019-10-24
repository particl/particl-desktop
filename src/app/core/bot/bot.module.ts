import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BotService } from './bot.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class BotModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: BotModule,
      providers: [
        BotService
      ]
    };
  }
}

export { BotService } from './bot.service';
