import { async, ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';

import { SharedModule } from '../../shared/shared.module';
import { WalletModule } from '../../wallet/wallet.module';
import { CoreModule } from '../../../core/core.module';
import { CoreUiModule } from '../../../core-ui/core-ui.module';

import { SellerOverviewComponent } from './seller-overview.component';

describe('SellerOverviewComponent', () => {
  let component: SellerOverviewComponent;
  let fixture: ComponentFixture<SellerOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        WalletModule.forRoot(),
        CoreModule.forRoot(),
        CoreUiModule.forRoot()
      ],
      declarations: [
        SellerOverviewComponent
      ]
    })

    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SellerOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
