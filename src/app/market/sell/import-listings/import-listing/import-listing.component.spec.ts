import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { CoreModule } from 'app/core/core.module';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MarketModule } from 'app/core/market/market.module';
import { ModalsModule } from 'app/modals/modals.module';
import { RpcWithStateModule } from 'app/core/rpc/rpc.module';
import { ModalsHelperService } from 'app/modals/modals-helper.service';
import { ImportListingComponent } from './import-listing.component';

describe('ImportListingComponent', () => {
  let component: ImportListingComponent;
  let fixture: ComponentFixture<ImportListingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportListingComponent ],
      imports: [
        CoreUiModule.forRoot(),
        CoreModule.forRoot(),
        BrowserAnimationsModule,
        RouterTestingModule,
        MarketModule.forRoot(),
        ModalsModule.forRoot(),
        RpcWithStateModule.forRoot()
      ],
      providers: [ ModalsHelperService ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportListingComponent);
    component = fixture.componentInstance;
    component.listing = {
      title: 'Test Title',
      category: {
        id: 1,
        name: 'Test Category'
      },
      shortDescription: 'Short Description',
      validationError: '',
      longDescription: 'Long Description',
      publish: true,
      images: ['base64:data']
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
