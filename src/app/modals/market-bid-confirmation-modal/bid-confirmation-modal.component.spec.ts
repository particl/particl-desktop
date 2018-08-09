import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material';

import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../wallet/shared/shared.module';
import { CoreUiModule } from '../../core-ui/core-ui.module';
import { ModalsModule } from 'app/modals/modals.module';

import { BidConfirmationModalComponent } from 'app/modals/market-bid-confirmation-modal/bid-confirmation-modal.component';

describe('BidConfirmationModalComponent', () => {
  let component: BidConfirmationModalComponent;
  let fixture: ComponentFixture<BidConfirmationModalComponent>;
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
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BidConfirmationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
