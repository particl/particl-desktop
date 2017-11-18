import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestComponent } from './test/test.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [TestComponent],
  exports: [
    TestComponent
  ]
})
export class MultiwalletModule { }

export { TestComponent } from './test/test.component';

