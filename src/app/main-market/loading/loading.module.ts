import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { LoadingComponent } from './loading.component';


const routes: Routes = [
  { path: '', component: LoadingComponent }
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
    LoadingComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LoadingModule { }
