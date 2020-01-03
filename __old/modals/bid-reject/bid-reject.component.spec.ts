import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../wallet/shared/shared.module';
import { CoreUiModule } from '../../core-ui/core-ui.module';

import { BidRejectComponent } from './bid-reject.component';

describe('ShippingComponent', () => {
  let component: BidRejectComponent;
  let fixture: ComponentFixture<BidRejectComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BidRejectComponent ],
      imports: [
        BrowserAnimationsModule,
        SharedModule,
        CoreModule.forRoot(),
        CoreUiModule.forRoot()
      ],
      providers: [
        /* deps */
        { provide: MatDialogRef }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BidRejectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
