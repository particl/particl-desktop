import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ClipboardModule } from 'ngx-clipboard';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { ManagementComponent } from './management.component';
import { CreateMarketComponent } from './create-market/create-market.component';
import { MarketBrowserComponent } from './market-browser/market-browser.component';
import { JoinWithDetailsModalComponent } from './market-browser/join-with-details-modal/join-with-details-modal.component';
import { JoinedMarketsComponent } from './joined-markets/joined-markets.component';
import { LeaveMarketConfirmationModalComponent } from './joined-markets/leave-market-modal/leave-market-modal.component';
import { PromoteMarketConfirmationModalComponent } from './joined-markets/promote-market-modal/promote-market-modal.component';
import { CategoryEditorModalComponent } from './joined-markets/category-editor-modal/category-editor-modal.component';
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
    JoinWithDetailsModalComponent,

    JoinedMarketsComponent,
    LeaveMarketConfirmationModalComponent,
    PromoteMarketConfirmationModalComponent,
    CategoryEditorModalComponent,

    CreateMarketComponent,
  ],
  entryComponents: [
    JoinWithDetailsModalComponent,

    LeaveMarketConfirmationModalComponent,
    PromoteMarketConfirmationModalComponent,
    CategoryEditorModalComponent
  ],
  providers: [
    MarketManagementService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ManagementModule { }
