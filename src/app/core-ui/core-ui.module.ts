import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
// TODO: move to material
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { MatDialogModule } from '@angular/material';
import { MatDialog } from '@angular/material';
import { GalleryModule } from '@ngx-gallery/core';
import { LightboxModule } from '@ngx-gallery/lightbox';
import { GallerizeModule } from '@ngx-gallery/gallerize';
import 'hammerjs';

import { DirectiveModule } from './directive/directive.module';
import { PipeModule } from './pipe/pipe.module';
import { MaterialModule } from './material/material.module';

import { PaginatorComponent } from 'app/core-ui/paginator/paginator.component';
import { HeaderComponent } from 'app/core-ui/components/header/header.component';
import { PageIntroComponent } from 'app/core-ui/components/page-intro/page-intro.component';


@NgModule({
  declarations: [
    PaginatorComponent,
    HeaderComponent,
    PageIntroComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
    MatDialogModule, // todo move
    InfiniteScrollModule,

    // also can add a config options
    GalleryModule, // GalleryModule.forRoot(galleryConfig?),
    LightboxModule, // GalleryLightbox.forRoot(lightboxConfig?),
    GallerizeModule,
    DirectiveModule,
    PipeModule
  ],
  exports: [
    MaterialModule,
    PaginatorComponent,
    InfiniteScrollModule,
    DirectiveModule,
    GalleryModule,
    LightboxModule,
    GallerizeModule,
    PipeModule,
    HeaderComponent,
    PageIntroComponent
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

