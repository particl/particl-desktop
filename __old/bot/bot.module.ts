import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { SharedModule } from 'app/wallet/shared/shared.module';
import { bot_routing } from './bot.routing';

import { ListComponent } from './list/list.component';
import { BotComponent } from './list/bot/bot.component';

@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    SharedModule,
    bot_routing
  ],
  declarations: [
    ListComponent,
    BotComponent
  ],
  schemas: []
})
export class BotModule { }
