import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarService } from './sidebar.service';
import { SidebarContainerComponent } from './sidebar-container/sidebar-container.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    SidebarContainerComponent,
    SidebarComponent
  ],
  exports: [
    SidebarContainerComponent,
    SidebarComponent
  ],
  providers: [
    SidebarService
  ]
})
export class SidebarModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SidebarModule
    };
  }
}
