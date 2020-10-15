import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { ExchangeBotsComponent } from './exchange-bots.component';
import { BotItemComponent } from './bot-item/bot-item.component';


const routes: Routes = [
  { path: '', component: ExchangeBotsComponent, data: { title: 'Bots'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    ExchangeBotsComponent,
    BotItemComponent
  ],
  entryComponents: [
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ExchangeBotsModule { }
