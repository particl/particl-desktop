import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ClipboardModule } from 'ngx-clipboard';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { ManagementComponent } from './management.component';
import { CreateMarketComponent } from './create-market/create-market.component';
import { EditMarketModalComponent } from './edit-market-modal/edit-market-modal.component';
import { MarketBrowserComponent } from './market-browser/market-browser.component';
import { JoinedMarketsComponent } from './joined-markets/joined-markets.component';
import { MarketManagementService } from './management.service';


const routes: Routes = [
  { path: '', component: ManagementComponent, data: { title: 'Manage Markets'} },
  { path: 'create', component: CreateMarketComponent, data: { title: 'Create Market'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule,
    ClipboardModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    ManagementComponent,
    MarketBrowserComponent,
    JoinedMarketsComponent,
    CreateMarketComponent,
    EditMarketModalComponent
  ],
  entryComponents: [
    EditMarketModalComponent
  ],
  providers: [
    MarketManagementService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ManagementModule { }
