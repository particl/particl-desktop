import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedModule } from 'app/wallet/shared/shared.module';
import { ModalsModule } from 'app/modals/modals.module';
import { CoreModule } from 'app/core/core.module';
import { CoreUiModule } from 'app/core-ui/core-ui.module';
import { MatDialogRef } from '@angular/material';

import { ListingExipryComponent } from './listing-exipry.component';

describe('ListingExipryComponent', () => {
  let component: ListingExipryComponent;
  let fixture: ComponentFixture<ListingExipryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        ModalsModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot()
      ],
      providers: [
        { provide: MatDialogRef }
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListingExipryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
