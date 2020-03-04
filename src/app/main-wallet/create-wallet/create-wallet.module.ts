import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ClipboardModule } from 'ngx-clipboard';
import { CoreUiModule } from 'app/core-ui/core-ui.module';

import { CreateWalletComponent } from './create-wallet.component';
import { WordsListComponent } from './words-list/words-list.component';


const routes: Routes = [
  {
    path: '', component: CreateWalletComponent
  }
];


@NgModule({
  imports: [
    CommonModule,
    CoreUiModule,
    ClipboardModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    CreateWalletComponent,
    WordsListComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CreateWalletModule { }
