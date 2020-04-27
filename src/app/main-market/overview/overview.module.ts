import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { OverviewComponent } from './overview.component';
import { MarketSharedModule } from '../shared/shared.module';
import { QuestionAnswerItemComponent } from './question-answer-item/question-answer-item.component';


const routes: Routes = [
  { path: '', component: OverviewComponent, data: { title: 'Market Overview'} }
];


@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    CoreUiModule,
    MarketSharedModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    OverviewComponent,
    QuestionAnswerItemComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OverviewModule { }
