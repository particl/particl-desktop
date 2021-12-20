import { WelcomeComponent } from './welcome.component';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';



const routes: Routes = [
  { path: '', component: WelcomeComponent }
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
    WelcomeComponent,
  ],
  entryComponents: [
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class WelcomeModule { }
