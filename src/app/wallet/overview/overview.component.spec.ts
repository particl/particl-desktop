import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MdCardModule, MdProgressBarModule } from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ModalsModule } from '../modals/modals.module';
import { SharedModule } from '../shared/shared.module';
import { WalletModule } from '../wallet/wallet.module';
import { RpcModule } from '../../core/rpc/rpc.module';

import { OverviewComponent } from './overview.component';
import { StakinginfoComponent } from './widgets/stakinginfo/stakinginfo.component';
import { ColdstakeComponent } from './widgets/coldstake/coldstake.component';



describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        WalletModule.forRoot(),
        RpcModule.forRoot(),
        ModalsModule,
        FlexLayoutModule,
        MdCardModule,
        MdProgressBarModule
      ],
      declarations: [
        OverviewComponent,
        StakinginfoComponent,
        ColdstakeComponent
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
