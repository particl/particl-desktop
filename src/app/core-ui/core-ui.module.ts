import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatDialogModule } from '@angular/material';
import { MatDialog } from '@angular/material';

import { DirectiveModule } from './directive/directive.module';
import { PipeModule } from './pipe/pipe.module';
import { MaterialModule } from './material/material.module';

import { PaginatorComponent } from 'app/core-ui/paginator/paginator.component';
import { HeaderComponent } from 'app/core-ui/components/header/header.component';
import { PageIntroComponent } from 'app/core-ui/components/page-intro/page-intro.component';
import { TermsContentComponent } from 'app/core-ui/components/terms-content/terms-content.component';


@NgModule({
  declarations: [
    PaginatorComponent,
    HeaderComponent,
    PageIntroComponent,
    TermsContentComponent,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    MatDialogModule, // todo move
    DirectiveModule,
    PipeModule
  ],
  exports: [
    MaterialModule,
    PaginatorComponent,
    DirectiveModule,
    PipeModule,
    HeaderComponent,
    PageIntroComponent,
    TermsContentComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CoreUiModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoreUiModule,
      providers: [
        MatDialog
      ]
    };
  }
}

export { MaterialModule } from './material/material.module';

