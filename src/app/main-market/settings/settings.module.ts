import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MarketSettingsComponent } from './settings.component';
import { MarketConsoleModalComponent } from './market-console-modal/market-console-modal.component';


const routes: Routes = [
  { path: '', component: MarketSettingsComponent, data: { title: 'Market Settings'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule,
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    MarketSettingsComponent,
    MarketConsoleModalComponent
  ],
  entryComponents: [
    MarketConsoleModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SettingsModule { }
