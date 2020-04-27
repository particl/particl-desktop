import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeSelectComponent } from './tree-select/tree-select.component';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { QuestionAnswerThreadComponent } from './question-answer-thread/question-answer-thread.component';


@NgModule({
  imports: [
    CommonModule,
    CoreUiModule
  ],
  declarations: [
    TreeSelectComponent,
    QuestionAnswerThreadComponent
  ],
  exports: [
    TreeSelectComponent,
    QuestionAnswerThreadComponent
  ],
  entryComponents: [
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MarketSharedModule { }

export { TreeSelectComponent } from './tree-select/tree-select.component';
