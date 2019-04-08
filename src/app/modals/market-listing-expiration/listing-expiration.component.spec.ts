import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SharedModule } from 'app/wallet/shared/shared.module';
import { ModalsModule } from 'app/modals/modals.module';
import { CoreModule } from 'app/core/core.module';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MatDialogRef } from '@angular/material';

import { ListingExpirationComponent } from './listing-expiration.component';

describe('ListingExpirationComponent', () => {
  let component: ListingExpirationComponent;
  let fixture: ComponentFixture<ListingExpirationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        ModalsModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot(),
        BrowserAnimationsModule
      ],
      providers: [
        { provide: MatDialogRef }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingExpirationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
