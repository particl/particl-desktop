import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { ManagementComponent } from './management.component';
import { CreateMarketComponent } from './create-market/create-market.component';
import { EditMarketModalComponent } from './edit-market-modal/edit-market-modal.component';


const routes: Routes = [
  { path: '', component: ManagementComponent, data: { title: 'Manage Markets'} },
  { path: 'create', component: CreateMarketComponent, data: { title: 'Create Market'} }
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
    ManagementComponent,
    CreateMarketComponent,
    EditMarketModalComponent
  ],
  entryComponents: [
    EditMarketModalComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ManagementModule { }
